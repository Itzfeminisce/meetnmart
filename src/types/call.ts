export enum CallAction {
  Incoming = "CALL_INCOMING",
  Outgoing = "CALL_OUTGOING",
  Accepted = "CALL_ACCEPTED",
  Rejected = "CALL_REJECTED",
  Ended = "CALL_ENDED",
  TimedOut = "CALL_TIMED_OUT",
}

export enum AppEvent {
  DISCONNECT = "disconnect"
}

export interface CallRequest {
  id: string;
  buyer_id: string;
  seller_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  room_name?: string;
  created_at: string;
}

export interface CallParticipant {
  id: string;
  user_id: string;
  call_id: string;
  role: 'buyer' | 'seller' | 'delivery' | 'observer';
  joined_at: string;
  left_at?: string;
}

export interface CallEvent {
  id: string;
  call_id: string;
  type: 'join' | 'leave' | 'mute_audio' | 'unmute_audio' | 'mute_video' | 'unmute_video' | 'start_screen_share' | 'stop_screen_share' | 'payment_request' | 'payment_success' | 'invite_delivery' | 'delivery_joined';
  participant_id: string;
  data?: Record<string, any>;
  created_at: string;
}
