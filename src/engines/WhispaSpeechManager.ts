// Enhanced Types with Performance Configurations
interface SpeechConfig {
  voiceGender: 'male' | 'female';
  voiceName: string | null;
  rate: number;
  pitch: number;
  volume: number;
  language: string;
  continuous: boolean;
  interimResults: boolean;
  personality: 'friendly' | 'professional' | 'playful';
  responseStyle: string;
  enthusiasm: number;
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
  onSpeechResult: (transcript: string, isFinal: boolean) => void;
  onSpeechError: (error: string) => void;
  onSpeakStart: () => void;
  onSpeakEnd: () => void;
  
  // New optimization configs
  maxContinuousListenTime?: number; // Auto-stop after X ms to save battery
  silenceDetectionTimeout?: number; // Stop after silence
  adaptiveQuality?: boolean; // Reduce quality on low battery
  backgroundThrottling?: boolean; // Reduce activity when tab not active
  voiceCacheSize?: number; // Limit voice cache
  debounceDelay?: number; // Debounce rapid calls
}

interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  priority?: 'high' | 'normal' | 'low'; // Queue priority
}

interface PerformanceMetrics {
  cpuUsage: number;
  batteryLevel: number;
  isLowPowerMode: boolean;
  memoryUsage: number;
  activeTime: number;
}

// Optimized SpeechManager Class
export class WhispaSpeechManager {
  private config: SpeechConfig;
  private recognition: SpeechRecognition | null;
  private synthesis: SpeechSynthesis | null;
  private isListening: boolean;
  private isSpeaking: boolean;
  private availableVoices: SpeechSynthesisVoice[];
  
  // Performance optimization properties
  private voiceCache: Map<string, SpeechSynthesisVoice>;
  private speechQueue: Array<{text: string, options: SpeechOptions, priority: number}>;
  private isProcessingQueue: boolean;
  private performanceMonitor: PerformanceObserver | null;
  private visibilityChangeHandler: (() => void) | null;
  private batteryManager: any; // BatteryManager API
  private lastActivityTime: number;
  private silenceTimer: number | null;
  private continuousListeningTimer: number | null;
  private debounceTimer: number | null;
  private memoryCleanupInterval: number | null;
  private adaptiveSettings: {
      originalRate: number;
      originalQuality: boolean;
  };

  constructor(config: Partial<SpeechConfig> = {}) {
      this.config = {
          voiceGender: config.voiceGender || 'female',
          voiceName: config.voiceName || null,
          rate: config.rate || 0.85,
          pitch: config.pitch || 1.1,
          volume: config.volume || 0.9,
          language: config.language || 'en-US',
          continuous: config.continuous || false,
          interimResults: config.interimResults || true,
          personality: config.personality || 'friendly',
          responseStyle: config.responseStyle || 'conversational',
          enthusiasm: config.enthusiasm || 0.7,
          maxContinuousListenTime: config.maxContinuousListenTime || 30000, // 30 seconds
          silenceDetectionTimeout: config.silenceDetectionTimeout || 5000, // 5 seconds
          adaptiveQuality: config.adaptiveQuality !== false,
          backgroundThrottling: config.backgroundThrottling !== false,
          voiceCacheSize: config.voiceCacheSize || 10,
          debounceDelay: config.debounceDelay || 100,
          onSpeechStart: config.onSpeechStart || (() => {}),
          onSpeechEnd: config.onSpeechEnd || (() => {}),
          onSpeechResult: config.onSpeechResult || (() => {}),
          onSpeechError: config.onSpeechError || (() => {}),
          onSpeakStart: config.onSpeakStart || (() => {}),
          onSpeakEnd: config.onSpeakEnd || (() => {})
      };

      // Initialize optimization properties
      this.recognition = null;
      this.synthesis = null;
      this.isListening = false;
      this.isSpeaking = false;
      this.availableVoices = [];
      this.voiceCache = new Map();
      this.speechQueue = [];
      this.isProcessingQueue = false;
      this.performanceMonitor = null;
      this.visibilityChangeHandler = null;
      this.batteryManager = null;
      this.lastActivityTime = Date.now();
      this.silenceTimer = null;
      this.continuousListeningTimer = null;
      this.debounceTimer = null;
      this.memoryCleanupInterval = null;
      this.adaptiveSettings = {
          originalRate: this.config.rate,
          originalQuality: this.config.interimResults
      };

      this.initializeSpeech();
      this.initializeOptimizations();
  }

  private async initializeOptimizations(): Promise<void> {
      // Initialize battery monitoring
      if ('getBattery' in navigator) {
          try {
              this.batteryManager = await (navigator as any).getBattery();
              this.batteryManager.addEventListener('levelchange', this.handleBatteryChange.bind(this));
              this.batteryManager.addEventListener('chargingchange', this.handleBatteryChange.bind(this));
          } catch (error) {
              console.warn('Battery API not available');
          }
      }

      // Setup visibility change handling for background throttling
      if (this.config.backgroundThrottling) {
          this.visibilityChangeHandler = this.handleVisibilityChange.bind(this);
          document.addEventListener('visibilitychange', this.visibilityChangeHandler);
      }

      // Setup performance monitoring
      if ('PerformanceObserver' in window) {
          try {
              this.performanceMonitor = new PerformanceObserver(this.handlePerformanceEntries.bind(this));
              this.performanceMonitor.observe({ entryTypes: ['measure', 'navigation'] });
          } catch (error) {
              console.warn('Performance monitoring not available');
          }
      }

      // Setup memory cleanup interval
      this.memoryCleanupInterval = window.setInterval(() => {
          this.cleanupMemory();
      }, 60000); // Every minute
  }

  private handleBatteryChange(): void {
      if (!this.batteryManager || !this.config.adaptiveQuality) return;

      const batteryLevel = this.batteryManager.level;
      const isCharging = this.batteryManager.charging;

      // Adaptive quality based on battery
      if (batteryLevel < 0.2 && !isCharging) {
          // Low battery mode - reduce quality
          this.config.rate = Math.max(0.7, this.adaptiveSettings.originalRate * 0.8);
          this.config.interimResults = false;
          
          // Stop continuous listening to save battery
          if (this.isListening && this.config.continuous) {
              this.stopListening();
          }
      } else if (batteryLevel > 0.5 || isCharging) {
          // Restore original settings
          this.config.rate = this.adaptiveSettings.originalRate;
          this.config.interimResults = this.adaptiveSettings.originalQuality;
      }
  }

  private handleVisibilityChange(): void {
      if (document.hidden) {
          // Page is hidden - throttle activity
          if (this.isListening && !this.config.continuous) {
              this.stopListening();
          }
          this.pauseQueue();
      } else {
          // Page is visible - resume normal activity
          this.resumeQueue();
      }
  }

  private handlePerformanceEntries(list: PerformanceObserverEntryList): void {
      const entries = list.getEntries();
      // Monitor for performance issues and adapt accordingly
      entries.forEach(entry => {
          if (entry.duration > 100) { // Long task detected
              // Reduce speech rate temporarily to ease CPU load
              this.config.rate = Math.max(0.6, this.config.rate * 0.9);
          }
      });
  }

  private cleanupMemory(): void {
      // Clean up voice cache if it's too large
      if (this.voiceCache.size > this.config.voiceCacheSize!) {
          const entries = Array.from(this.voiceCache.entries());
          // Keep only the most recently used voices
          const toKeep = entries.slice(-this.config.voiceCacheSize!);
          this.voiceCache.clear();
          toKeep.forEach(([key, value]) => this.voiceCache.set(key, value));
      }

      // Clear completed speech queue items
      this.speechQueue = this.speechQueue.filter(item => item !== null);
  }

  private initializeSpeech(): void {
      if (typeof window === 'undefined') return;

      // Initialize Speech Recognition with optimizations
      if (typeof window !== 'undefined') {
          const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          if (SpeechRecognitionAPI) {
              this.recognition = new SpeechRecognitionAPI();
              this.recognition.continuous = this.config.continuous;
              this.recognition.interimResults = this.config.interimResults;
              this.recognition.lang = this.config.language;

              this.recognition.onstart = () => {
                  this.isListening = true;
                  this.lastActivityTime = Date.now();
                  this.config.onSpeechStart();
                  
                  // Set maximum continuous listening time
                  if (this.config.continuous && this.config.maxContinuousListenTime) {
                      this.continuousListeningTimer = window.setTimeout(() => {
                          this.stopListening();
                      }, this.config.maxContinuousListenTime);
                  }
              };

              this.recognition.onresult = (event: SpeechRecognitionEvent) => {
                  this.lastActivityTime = Date.now();
                  
                  // Reset silence timer on speech detection
                  if (this.silenceTimer) {
                      clearTimeout(this.silenceTimer);
                      this.silenceTimer = null;
                  }

                  let transcript = '';
                  for (let i = event.resultIndex; i < event.results.length; i++) {
                      transcript += event.results[i][0].transcript;
                  }
                  
                  const isFinal = event.results[event.results.length - 1].isFinal;
                  this.config.onSpeechResult(transcript, isFinal);

                  // Set silence detection timer after final result
                  if (isFinal && this.config.silenceDetectionTimeout) {
                      this.silenceTimer = window.setTimeout(() => {
                          if (this.isListening) {
                              this.stopListening();
                          }
                      }, this.config.silenceDetectionTimeout);
                  }
              };

              this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                  this.isListening = false;
                  this.clearTimers();
                  this.config.onSpeechError(event.error);
              };

              this.recognition.onend = () => {
                  this.isListening = false;
                  this.clearTimers();
                  this.config.onSpeechEnd();
              };
          }
      }

      // Initialize Speech Synthesis with lazy loading
      if ('speechSynthesis' in window) {
          this.synthesis = window.speechSynthesis;
          // Lazy load voices only when needed
          this.loadVoicesLazy();
      }
  }

  private loadVoicesLazy(): void {
      if (!this.synthesis) return;
      
      // Use requestIdleCallback for non-blocking voice loading
      const loadVoices = () => {
          if (this.synthesis) {
              this.availableVoices = this.synthesis.getVoices();
              this.cachePreferredVoices();
          }
      };

      if ('requestIdleCallback' in window) {
          requestIdleCallback(loadVoices);
      } else {
          setTimeout(loadVoices, 0);
      }
      
      if (speechSynthesis.onvoiceschanged !== undefined) {
          speechSynthesis.onvoiceschanged = loadVoices;
      }
  }

  private cachePreferredVoices(): void {
      // Pre-cache commonly used voices for faster access
      const preferredVoices = this.availableVoices.filter(voice => {
          const isRightLanguage = voice.lang.startsWith(this.config.language.split('-')[0]);
          return isRightLanguage;
      });

      preferredVoices.slice(0, 3).forEach(voice => {
          const cacheKey = `${voice.lang}-${this.config.voiceGender}`;
          if (!this.voiceCache.has(cacheKey)) {
              this.voiceCache.set(cacheKey, voice);
          }
      });
  }

  private selectVoiceOptimized(): SpeechSynthesisVoice | null {
      const cacheKey = `${this.config.language}-${this.config.voiceGender}`;
      
      // Try cache first
      if (this.voiceCache.has(cacheKey)) {
          return this.voiceCache.get(cacheKey)!;
      }

      // Fallback to original selection logic
      const voice = this.selectVoice();
      if (voice) {
          this.voiceCache.set(cacheKey, voice);
      }
      return voice;
  }

  private selectVoice(): SpeechSynthesisVoice | null {
      if (!this.availableVoices.length) return null;
      
      if (this.config.voiceName) {
          const namedVoice = this.availableVoices.find(voice => 
              voice.name.toLowerCase().includes(this.config.voiceName?.toLowerCase() || '')
          );
          if (namedVoice) return namedVoice;
      }
      
      const preferredVoices = this.availableVoices.filter(voice => {
          const isRightGender = this.config.voiceGender === 'female' 
              ? voice.name.toLowerCase().includes('female') || 
                voice.name.toLowerCase().includes('woman') ||
                !voice.name.toLowerCase().includes('male')
              : voice.name.toLowerCase().includes('male') || 
                voice.name.toLowerCase().includes('man');
          
          const isRightLanguage = voice.lang.startsWith(this.config.language.split('-')[0]);
          
          return isRightGender && isRightLanguage;
      });
      
      return preferredVoices[0] || 
             this.availableVoices.find(v => v.lang.startsWith('en')) || 
             this.availableVoices[0];
  }

  private clearTimers(): void {
      if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
      }
      if (this.continuousListeningTimer) {
          clearTimeout(this.continuousListeningTimer);
          this.continuousListeningTimer = null;
      }
  }

  async startListening(): Promise<void> {
      if (this.recognition && !this.isListening) {
          try {
              await navigator.mediaDevices.getUserMedia({ audio: true });
              this.recognition.start();
          } catch (error) {
              this.config.onSpeechError('Permission denied');
          }
      }
  }

  stopListening(): void {
      if (this.recognition && this.isListening) {
          this.recognition.stop();
      }
      this.clearTimers();
  }

  // Optimized speak method with queuing and prioritization
  speak(text: string, options: SpeechOptions = {}): void {
      if (!this.synthesis || !text) return;
      
      // Debounce rapid speak calls
      if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = window.setTimeout(() => {
          const priority = this.getPriority(options.priority || 'normal');
          this.addToQueue(text, options, priority);
          this.processQueue();
      }, this.config.debounceDelay);
  }

  private getPriority(level: 'high' | 'normal' | 'low'): number {
      switch (level) {
          case 'high': return 3;
          case 'normal': return 2;
          case 'low': return 1;
          default: return 2;
      }
  }

  private addToQueue(text: string, options: SpeechOptions, priority: number): void {
      this.speechQueue.push({ text, options, priority });
      // Sort by priority (highest first)
      this.speechQueue.sort((a, b) => b.priority - a.priority);
      
      // Limit queue size to prevent memory issues
      if (this.speechQueue.length > 10) {
          this.speechQueue = this.speechQueue.slice(0, 10);
      }
  }

  private async processQueue(): Promise<void> {
      if (this.isProcessingQueue || this.speechQueue.length === 0) return;
      
      this.isProcessingQueue = true;
      
      while (this.speechQueue.length > 0) {
          // Check if page is hidden and background throttling is enabled
          if (document.hidden && this.config.backgroundThrottling) {
              await this.waitForVisibility();
          }

          const item = this.speechQueue.shift();
          if (item) {
              await this.speakImmediate(item.text, item.options);
          }
      }
      
      this.isProcessingQueue = false;
  }

  private waitForVisibility(): Promise<void> {
      return new Promise(resolve => {
          if (!document.hidden) {
              resolve();
              return;
          }
          
          const handler = () => {
              if (!document.hidden) {
                  document.removeEventListener('visibilitychange', handler);
                  resolve();
              }
          };
          document.addEventListener('visibilitychange', handler);
      });
  }

  private speakImmediate(text: string, options: SpeechOptions = {}): Promise<void> {
      return new Promise((resolve) => {
          if (!this.synthesis) {
              resolve();
              return;
          }
          
          this.synthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(text);
          const selectedVoice = this.selectVoiceOptimized();
          
          if (selectedVoice) {
              utterance.voice = selectedVoice;
          }
          
          utterance.rate = options.rate || this.config.rate;
          utterance.pitch = options.pitch || this.config.pitch;
          utterance.volume = options.volume || this.config.volume;
          
          utterance.onstart = () => {
              this.isSpeaking = true;
              this.config.onSpeakStart();
          };
          
          utterance.onend = () => {
              this.isSpeaking = false;
              this.config.onSpeakEnd();
              resolve();
          };
          
          utterance.onerror = () => {
              this.isSpeaking = false;
              this.config.onSpeakEnd();
              resolve();
          };
          
          this.synthesis.speak(utterance);
      });
  }

  pauseQueue(): void {
      if (this.synthesis) {
          this.synthesis.pause();
      }
  }

  resumeQueue(): void {
      if (this.synthesis) {
          this.synthesis.resume();
      }
  }

  stopSpeaking(): void {
      if (this.synthesis) {
          this.synthesis.cancel();
          this.isSpeaking = false;
      }
      this.speechQueue = []; // Clear queue
  }

  // Enhanced response with caching
  enhanceResponse(text: string): string {
      const cacheKey = `${text}-${this.config.personality}-${this.config.enthusiasm}-${this.config.responseStyle}`;
      
      // Use LRU cache for enhanced responses
      if ((this as any).responseCache?.has(cacheKey)) {
          return (this as any).responseCache.get(cacheKey);
      }

      const { personality, enthusiasm, responseStyle } = this.config;
      let enhanced = text;
      
      // Apply personality-based enhancements
      switch (personality) {
          case 'friendly':
              const friendlyPrefixes = [
                  'Oh, that\'s interesting! ',
                  'Great question! ',
                  'I\'d love to help with that! ',
                  'Let me tell you about that! ',
                  'That\'s a wonderful question! '
              ];
              if (Math.random() < enthusiasm) {
                  enhanced = friendlyPrefixes[Math.floor(Math.random() * friendlyPrefixes.length)] + enhanced;
              }
              break;
              
          case 'professional':
              enhanced = enhanced
                  .replace(/!/g, '.')
                  .replace(/\s+/g, ' ')
                  .replace(/[A-Za-z]+/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
              break;
              
          case 'playful':
              const emojis = ['✨', '🌟', '💫', '🎉', '🎯', '🎨', '🎭', '🎪'];
              const playfulPrefixes = ['Ta-da! ', 'Voilà! ', 'Here we go! '];
              if (Math.random() < enthusiasm) {
                  enhanced = playfulPrefixes[Math.floor(Math.random() * playfulPrefixes.length)] + enhanced;
                  enhanced += ' ' + emojis[Math.floor(Math.random() * emojis.length)];
              }
              break;
      }
      
      // Apply response style enhancements
      if (responseStyle === 'conversational') {
          enhanced = enhanced.replace(/\./g, '...').replace(/\?/g, '??');
      } else if (responseStyle === 'formal') {
          enhanced = enhanced.replace(/\.\.\./g, '.').replace(/\?\?/g, '?');
      }
      
      // Initialize cache if needed
      if (!(this as any).responseCache) {
          (this as any).responseCache = new Map();
      }
      
      // Cache the result with size limit
      if ((this as any).responseCache.size >= 100) {
          const firstKey = (this as any).responseCache.keys().next().value;
          (this as any).responseCache.delete(firstKey);
      }
      (this as any).responseCache.set(cacheKey, enhanced);
      
      return enhanced;
  }

  // Performance monitoring
  getPerformanceMetrics(): PerformanceMetrics {
      return {
          cpuUsage: this.estimateCPUUsage(),
          batteryLevel: this.batteryManager?.level || 1,
          isLowPowerMode: this.batteryManager?.level < 0.2 && !this.batteryManager?.charging,
          memoryUsage: this.estimateMemoryUsage(),
          activeTime: Date.now() - this.lastActivityTime
      };
  }

  private estimateCPUUsage(): number {
      // Simple CPU usage estimation based on activity
      const activeFeatures = [
          this.isListening,
          this.isSpeaking,
          this.isProcessingQueue,
          this.speechQueue.length > 0
      ].filter(Boolean).length;
      
      return (activeFeatures / 4) * 100; // Rough percentage
  }

  private estimateMemoryUsage(): number {
      // Estimate memory usage based on cached data
      const voiceCacheSize = this.voiceCache.size * 100; // Rough estimate
      const queueSize = this.speechQueue.length * 50;
      const responseCache = (this as any).responseCache?.size * 100 || 0;
      
      return voiceCacheSize + queueSize + responseCache; // Bytes (rough estimate)
  }

  updateConfig(newConfig: Partial<SpeechConfig>): void {
      const oldConfig = { ...this.config };
      this.config = { ...this.config, ...newConfig };
      
      // Update adaptive settings if rate changed
      if (newConfig.rate && newConfig.rate !== oldConfig.rate) {
          this.adaptiveSettings.originalRate = newConfig.rate;
      }
      if (newConfig.interimResults !== undefined && newConfig.interimResults !== oldConfig.interimResults) {
          this.adaptiveSettings.originalQuality = newConfig.interimResults;
      }
      
      // Reconfigure recognition if language changed
      if (newConfig.language && newConfig.language !== oldConfig.language && this.recognition) {
          this.recognition.lang = newConfig.language;
          this.voiceCache.clear(); // Clear cache for new language
      }
  }

  destroy(): void {
      // Clean up all resources
      if (this.recognition) {
          this.recognition.stop();
      }
      if (this.synthesis) {
          this.synthesis.cancel();
      }
      
      // Clear all timers
      this.clearTimers();
      if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
      }
      if (this.memoryCleanupInterval) {
          clearInterval(this.memoryCleanupInterval);
      }
      
      // Remove event listeners
      if (this.visibilityChangeHandler) {
          document.removeEventListener('visibilitychange', this.visibilityChangeHandler);
      }
      if (this.batteryManager) {
          this.batteryManager.removeEventListener('levelchange', this.handleBatteryChange);
          this.batteryManager.removeEventListener('chargingchange', this.handleBatteryChange);
      }
      if (this.performanceMonitor) {
          this.performanceMonitor.disconnect();
      }
      
      // Clear caches
      this.voiceCache.clear();
      this.speechQueue = [];
      if ((this as any).responseCache) {
          (this as any).responseCache.clear();
      }
  }
}