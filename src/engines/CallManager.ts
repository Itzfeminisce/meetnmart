import { EventEmitter } from 'events';

interface ICEServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

interface CallOptions {
  audio?: boolean;
  video?: boolean;
  targetUserId: string;
  callId?: string;
  callType?: 'audio' | 'video';
  autoAccept?: boolean;
}

interface MediaHandlers {
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onTrack?: (track: MediaStreamTrack, stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}

class CallManager extends EventEmitter {
  private static instance: CallManager;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private signallingServer: WebSocket | null = null;
  private currentCallId: string | null = null;
  private mediaHandlers: MediaHandlers = {};
  private iceServers: ICEServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    // Add your TURN servers here for production
  ];
  
  constructor() {
    super();
    this.setupEventListeners();
  }
  
  static getInstance(): CallManager {
    if (!CallManager.instance) {
      CallManager.instance = new CallManager();
    }
    return CallManager.instance;
  }
  
  /**
   * Set up event listeners for call-related events
   */
  private setupEventListeners(): void {
    if (typeof window !== 'undefined') {
      // Listen for call acceptance from notification
      window.addEventListener('call-accepted', (event: any) => {
        const callData = event.detail;
        if (callData && callData.callId) {
          this.handleAcceptedCall(callData);
        }
      });
      
      // Listen for call rejection from notification
      window.addEventListener('call-rejected', (event: any) => {
        const callData = event.detail;
        if (callData && callData.callId) {
          this.handleRejectedCall(callData);
        }
      });
    }
  }
  
  /**
   * Connect to signalling server
   */
  async connectToSignallingServer(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.signallingServer = new WebSocket(url);
        
        this.signallingServer.onopen = () => {
          console.log('Connected to signalling server');
          resolve(true);
        };
        
        this.signallingServer.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleSignallingMessage(message);
          } catch (error) {
            console.error('Error parsing signalling message:', error);
          }
        };
        
        this.signallingServer.onerror = (error) => {
          console.error('Signalling server error:', error);
          resolve(false);
        };
        
        this.signallingServer.onclose = () => {
          console.log('Signalling server connection closed');
          this.signallingServer = null;
        };
      } catch (error) {
        console.error('Failed to connect to signalling server:', error);
        resolve(false);
      }
    });
  }
  
  /**
   * Handle incoming signalling messages
   */
  private handleSignallingMessage(message: any): void {
    switch (message.type) {
      case 'offer':
        this.handleOffer(message);
        break;
      case 'answer':
        this.handleAnswer(message);
        break;
      case 'ice-candidate':
        this.handleIceCandidate(message);
        break;
      case 'call-ended':
        this.handleCallEnded(message);
        break;
      default:
        console.warn('Unknown signalling message type:', message.type);
    }
  }
  
  /**
   * Initialize peer connection
   */
  private async initializePeerConnection(): Promise<RTCPeerConnection> {
    if (this.peerConnection) {
      this.closePeerConnection();
    }
    
    this.peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers
    });
    
    // Set up event handlers
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.signallingServer) {
        this.sendSignallingMessage({
          type: 'ice-candidate',
          callId: this.currentCallId,
          candidate: event.candidate
        });
      }
    };
    
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.track);
      
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      
      this.remoteStream.addTrack(event.track);
      
      if (this.mediaHandlers.onTrack) {
        this.mediaHandlers.onTrack(event.track, this.remoteStream);
      }
      
      if (this.mediaHandlers.onRemoteStream) {
        this.mediaHandlers.onRemoteStream(this.remoteStream);
      }
    };
    
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection?.connectionState);
      
      if (this.mediaHandlers.onConnectionStateChange && this.peerConnection) {
        this.mediaHandlers.onConnectionStateChange(this.peerConnection.connectionState);
      }
      
      // Handle disconnection
      if (this.peerConnection?.connectionState === 'disconnected' || 
          this.peerConnection?.connectionState === 'failed') {
        this.emit('call-ended', {
          reason: 'connection-lost',
          callId: this.currentCallId
        });
      }
    };
    
    return this.peerConnection;
  }
  
  /**
   * Handle accepted call from notification
   */
  private async handleAcceptedCall(callData: any): Promise<void> {
    console.log('Handling accepted call:', callData);
    
    // Emit event for UI to handle
    this.emit('call-accepted', callData);
    
    // Check if we're already in this call
    if (this.currentCallId === callData.callId) {
      console.log('Already in this call, no action needed');
      return;
    }
    
    // Start the call process
    try {
      await this.initializeLocalMedia({
        audio: true,
        video: callData.callType === 'video',
        targetUserId: callData.callerId || callData.targetUserId,
        callId: callData.callId,
        callType: callData.callType || 'audio',
        autoAccept: true
      });
      
      // Connect to caller
      await this.acceptCall(callData.callId);
    } catch (error) {
      console.error('Failed to handle accepted call:', error);
      this.emit('call-failed', {
        reason: 'media-error',
        error,
        callId: callData.callId
      });
    }
  }
  
  /**
   * Handle rejected call from notification
   */
  private handleRejectedCall(callData: any): void {
    console.log('Handling rejected call:', callData);
    
    // Emit event for UI to handle
    this.emit('call-rejected', callData);
    
    // If we're in this call, end it
    if (this.currentCallId === callData.callId) {
      this.endCall('rejected');
    }
  }
  
  /**
   * Initialize local media (audio/video)
   */
  async initializeLocalMedia(options: CallOptions): Promise<MediaStream> {
    try {
      // Request media access
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: options.audio !== false,
        video: options.video === true
      });
      
      // Store call ID
      this.currentCallId = options.callId || crypto.randomUUID();
      
      // Notify handlers
      if (this.mediaHandlers.onLocalStream) {
        this.mediaHandlers.onLocalStream(this.localStream);
      }
      
      return this.localStream;
    } catch (error) {
      console.error('Failed to access media devices:', error);
      throw new Error(`Media access failed: ${error}`);
    }
  }
  
  /**
   * Send signalling message
   */
  private sendSignallingMessage(message: any): void {
    if (!this.signallingServer || this.signallingServer.readyState !== WebSocket.OPEN) {
      console.error('Signalling server not connected');
      return;
    }
    
    try {
      this.signallingServer.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send signalling message:', error);
    }
  }
  
  /**
   * Start a call
   */
  async startCall(options: CallOptions): Promise<string> {
    try {
      // Initialize media if not already initialized
      if (!this.localStream) {
        await this.initializeLocalMedia(options);
      }
      
      // Create peer connection
      const peerConnection = await this.initializePeerConnection();
      
      // Add local tracks to the connection
      this.localStream.getTracks().forEach(track => {
        if (this.localStream && this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });
      
      // Create offer
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: options.callType === 'video'
      });
      
      // Set local description
      await peerConnection.setLocalDescription(offer);
      
      // Send offer via signalling server
      this.sendSignallingMessage({
        type: 'offer',
        callId: this.currentCallId,
        targetUserId: options.targetUserId,
        offer: peerConnection.localDescription,
        callType: options.callType || 'audio'
      });
      
      // Emit event for UI
      this.emit('call-initiated', {
        callId: this.currentCallId,
        targetUserId: options.targetUserId,
        callType: options.callType || 'audio'
      });
      
      return this.currentCallId;
    } catch (error) {
      console.error('Failed to start call:', error);
      throw error;
    }
  }
  
  /**
   * Accept an incoming call
   */
  async acceptCall(callId: string): Promise<void> {
    try {
      // If we don't have a peer connection yet, something is wrong
      if (!this.peerConnection) {
        throw new Error('No call to accept');
      }
      
      // Send answer via signalling server
      this.sendSignallingMessage({
        type: 'call-accepted',
        callId,
        answer: this.peerConnection.localDescription
      });
      
      // Emit event for UI
      this.emit('call-connected', {
        callId,
        connectionState: this.peerConnection.connectionState
      });
    } catch (error) {
      console.error('Failed to accept call:', error);
      throw error;
    }
  }
  
  /**
   * Handle an incoming call offer
   */
  private async handleOffer(message: any): Promise<void> {
    try {
      // Create peer connection if needed
      if (!this.peerConnection) {
        await this.initializePeerConnection();
      }
      
      // Set remote description from offer
      const offerDesc = new RTCSessionDescription(message.offer);
      await this.peerConnection.setRemoteDescription(offerDesc);
      
      // Store call ID
      this.currentCallId = message.callId;
      
      // Emit incoming call event for UI
      this.emit('incoming-call', {
        callId: message.callId,
        callerId: message.callerId,
        callerName: message.callerName,
        callType: message.callType || 'audio'
      });
      
      // Auto-accept if specified (e.g., when accepting from notification)
      if (message.autoAccept) {
        // Request media if not already available
        if (!this.localStream) {
          await this.initializeLocalMedia({
            audio: true,
            video: message.callType === 'video',
            targetUserId: message.callerId,
            callId: message.callId,
            callType: message.callType || 'audio'
          });
          
          // Add local tracks to connection
          this.localStream.getTracks().forEach(track => {
            if (this.localStream && this.peerConnection) {
              this.peerConnection.addTrack(track, this.localStream);
            }
          });
        }
        
        // Create answer
        const answer = await this.peerConnection.createAnswer();
        
        // Set local description
        await this.peerConnection.setLocalDescription(answer);
        
        // Accept the call
        await this.acceptCall(message.callId);
      }
    } catch (error) {
      console.error('Failed to handle offer:', error);
      this.emit('call-failed', {
        reason: 'offer-handling-failed',
        error,
        callId: message.callId
      });
    }
  }
  
  /**
   * Handle answer to our call
   */
  private async handleAnswer(message: any): Promise<void> {
    try {
      if (!this.peerConnection) {
        throw new Error('No active call');
      }
      
      // Set remote description from answer
      const answerDesc = new RTCSessionDescription(message.answer);
      await this.peerConnection.setRemoteDescription(answerDesc);
      
      // Emit event for UI
      this.emit('call-accepted', {
        callId: message.callId,
        connectionState: this.peerConnection.connectionState
      });
    } catch (error) {
      console.error('Failed to handle answer:', error);
    }
  }
  
  /**
   * Handle ICE candidate from remote peer
   */
  private async handleIceCandidate(message: any): Promise<void> {
    try {
      if (!this.peerConnection) {
        throw new Error('No active call');
      }
      
      // Add ICE candidate to connection
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
    } catch (error) {
      console.error('Failed to add ICE candidate:', error);
    }
  }
  
  /**
   * Handle call end message from signalling server
   */
  private handleCallEnded(message: any): void {
    if (this.currentCallId === message.callId) {
      // Clean up resources
      this.cleanupCall();
      
      // Emit event for UI
      this.emit('call-ended', {
        callId: message.callId,
        reason: message.reason || 'remote-ended'
      });
    }
  }
  
  /**
   * End the current call
   */
  async endCall(reason: string = 'local-ended'): Promise<void> {
    if (!this.currentCallId) {
      console.warn('No active call to end');
      return;
    }
    
    // Send end call message via signalling server
    this.sendSignallingMessage({
      type: 'call-ended',
      callId: this.currentCallId,
      reason
    });
    
    // Clean up resources
    this.cleanupCall();
    
    // Emit event for UI
    this.emit('call-ended', {
      callId: this.currentCallId,
      reason
    });
    
    // Clear current call ID
    this.currentCallId = null;
  }
  
  /**
   * Clean up call resources
   */
  private cleanupCall(): void {
    // Stop local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    // Close peer connection
    this.closePeerConnection();
    
    // Clear remote stream
    this.remoteStream = null;
  }
  
  /**
   * Close and clean up peer connection
   */
  private closePeerConnection(): void {
    if (this.peerConnection) {
      try {
        this.peerConnection.close();
      } catch (error) {
        console.error('Error closing peer connection:', error);
      } finally {
        this.peerConnection = null;
      }
    }
  }
  
  /**
   * Set media event handlers
   */
  setMediaHandlers(handlers: MediaHandlers): void {
    this.mediaHandlers = { ...this.mediaHandlers, ...handlers };
  }
  
  /**
   * Set custom ICE servers (STUN/TURN)
   */
  setICEServers(servers: ICEServer[]): void {
    this.iceServers = servers;
  }
  
  /**
   * Toggle audio mute state
   */
  toggleAudio(mute: boolean): boolean {
    if (!this.localStream) return false;
    
    const audioTracks = this.localStream.getAudioTracks();
    if (audioTracks.length === 0) return false;
    
    audioTracks.forEach(track => {
      track.enabled = !mute;
    });
    
    return !audioTracks[0].enabled;
  }
  
  /**
   * Toggle video state
   */
  toggleVideo(disable: boolean): boolean {
    if (!this.localStream) return false;
    
    const videoTracks = this.localStream.getVideoTracks();
    if (videoTracks.length === 0) return false;
    
    videoTracks.forEach(track => {
      track.enabled = !disable;
    });
    
    return !videoTracks[0].enabled;
  }
  
  /**
   * Check if there's an active call
   */
  hasActiveCall(): boolean {
    return this.currentCallId !== null && this.peerConnection !== null;
  }
  
  /**
   * Get the current call ID
   */
  getCurrentCallId(): string | null {
    return this.currentCallId;
  }
  
  /**
   * Get the current call state
   */
  getCallState(): {
    callId: string | null;
    hasLocalStream: boolean;
    hasRemoteStream: boolean; 
    connectionState: RTCPeerConnectionState | null;
  } {
    return {
      callId: this.currentCallId,
      hasLocalStream: !!this.localStream,
      hasRemoteStream: !!this.remoteStream,
      connectionState: this.peerConnection?.connectionState || null
    };
  }
}

export default CallManager;