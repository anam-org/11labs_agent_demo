/**
 * ElevenLabs Conversational AI
 *
 * Handles WebSocket connection to ElevenLabs and microphone capture.
 */

import { MicrophoneCapture, arrayBufferToBase64 } from "chatdio";

const SAMPLE_RATE = 16000;

let websocket: WebSocket | null = null;
let micCapture: MicrophoneCapture | null = null;
let isInitialized = false;

interface ElevenLabsMessage {
  type: string;
  audio_event?: { audio_base_64: string };
  user_transcription_event?: { user_transcript: string };
  agent_response_event?: { agent_response: string };
  ping_event?: { event_id: number };
}

export interface ElevenLabsCallbacks {
  onReady?: () => void;
  onAudio?: (base64Audio: string) => void;
  onUserTranscript?: (text: string) => void;
  onAgentResponse?: (text: string) => void;
  onDisconnect?: () => void;
  onError?: () => void;
}

/**
 * Set up microphone capture and send audio to ElevenLabs
 */
async function setupMicrophone() {
  micCapture = new MicrophoneCapture({
    sampleRate: SAMPLE_RATE,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  });

  micCapture.on("data", (data: ArrayBuffer) => {
    if (websocket?.readyState === WebSocket.OPEN && isInitialized) {
      websocket.send(
        JSON.stringify({ user_audio_chunk: arrayBufferToBase64(data) })
      );
    }
  });

  await micCapture.start();
  console.log("[Mic] Capturing at 16kHz");
}

/**
 * Connect to ElevenLabs Conversational AI WebSocket
 */
export async function connectElevenLabs(
  agentId: string,
  callbacks: ElevenLabsCallbacks
) {
  websocket = new WebSocket(
    `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}`
  );

  websocket.onopen = async () => {
    await setupMicrophone();
    callbacks.onReady?.();
  };

  websocket.onmessage = (event) => {
    const msg: ElevenLabsMessage = JSON.parse(event.data);

    switch (msg.type) {
      case "conversation_initiation_metadata":
        isInitialized = true;
        console.log("[11Labs] Ready");
        break;

      case "audio":
        if (msg.audio_event?.audio_base_64) {
          callbacks.onAudio?.(msg.audio_event.audio_base_64);
        }
        break;

      case "agent_response":
        if (msg.agent_response_event?.agent_response) {
          callbacks.onAgentResponse?.(msg.agent_response_event.agent_response);
        }
        break;

      case "user_transcript":
        if (msg.user_transcription_event?.user_transcript) {
          callbacks.onUserTranscript?.(
            msg.user_transcription_event.user_transcript
          );
        }
        break;

      case "ping":
        websocket?.send(
          JSON.stringify({ type: "pong", event_id: msg.ping_event?.event_id })
        );
        break;
    }
  };

  websocket.onclose = () => {
    isInitialized = false;
    callbacks.onDisconnect?.();
  };

  websocket.onerror = () => callbacks.onError?.();
}

/**
 * Disconnect from ElevenLabs and stop microphone
 */
export function stopElevenLabs() {
  isInitialized = false;
  websocket?.close();
  websocket = null;
  micCapture?.stop();
  micCapture = null;
}
