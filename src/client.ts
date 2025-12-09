/**
 * ElevenLabs + Anam Integration Demo
 *
 * Main client - orchestrates the UI and connects the modules together.
 */

import { base64ToArrayBuffer } from "chatdio";
import { createClient } from "@anam-ai/js-sdk";
import type AnamClient from "@anam-ai/js-sdk/dist/module/AnamClient";
import { connectElevenLabs, stopElevenLabs } from "./elevenlabs";

// Temporary type for new SDK feature (until types are updated)
interface AudioPassthroughStream {
  sendAudioChunk(data: string): void;
  endOfSpeech(): void;
}

// ============================================================================
// STATE
// ============================================================================

let isConnected = false;
let anamClient: AnamClient | null = null;
let audioStream: AudioPassthroughStream | null = null;

interface Config {
  anamSessionToken: string;
  elevenLabsAgentId: string;
}

// ============================================================================
// DOM
// ============================================================================

const $ = (id: string) => document.getElementById(id);
const connectBtn = $("connect-btn") as HTMLButtonElement;
const btnText = $("btn-text") as HTMLSpanElement;
const transcript = $("transcript") as HTMLDivElement;
const statusText = $("status-text") as HTMLParagraphElement;
const anamVideo = $("anam-video") as HTMLVideoElement;
const avatarPlaceholder = $("avatar-placeholder") as HTMLDivElement;
const errorContainer = $("error-container") as HTMLDivElement;
const errorText = $("error-text") as HTMLParagraphElement;

// ============================================================================
// UI HELPERS
// ============================================================================

function setConnected(connected: boolean) {
  isConnected = connected;
  btnText.textContent = connected ? "End Conversation" : "Start Conversation";
  connectBtn.classList.toggle("bg-red-600", connected);
  connectBtn.classList.toggle("hover:bg-red-500", connected);
  connectBtn.classList.toggle("bg-labs-600", !connected);
  connectBtn.classList.toggle("hover:bg-labs-500", !connected);
  statusText.textContent = connected ? "Listening" : "Disconnected";
}

function showVideo(show: boolean) {
  anamVideo.classList.toggle("hidden", !show);
  avatarPlaceholder.classList.toggle("hidden", show);
}

function addMessage(role: "user" | "agent" | "system", text: string) {
  if (transcript.querySelector(".text-center")) {
    transcript.innerHTML = "";
  }

  const color =
    role === "user"
      ? "text-blue-400"
      : role === "agent"
      ? "text-labs-400"
      : "text-zinc-500";
  const label = role === "user" ? "You" : role === "agent" ? "Agent" : "•";

  transcript.insertAdjacentHTML(
    "beforeend",
    `<div class="fade-in">
      <span class="${color} font-medium">${label}:</span>
      <span class="text-zinc-200">${text}</span>
    </div>`
  );
  transcript.scrollTop = transcript.scrollHeight;
}

function showError(message: string) {
  errorText.textContent = message;
  errorContainer.classList.remove("hidden");
  setTimeout(() => errorContainer.classList.add("hidden"), 5000);
}

// ============================================================================
// MAIN
// ============================================================================

async function start() {
  connectBtn.disabled = true;
  btnText.textContent = "Connecting...";

  try {
    // Fetch config from server
    const res = await fetch("/api/config");
    const config: Config = await res.json();

    // Initialize Anam avatar (avatarOnly mode)
    anamClient = createClient(config.anamSessionToken);
    await anamClient.streamToVideoElement("anam-video");
    showVideo(true);

    // Create audio passthrough stream for faster-than-realtime delivery
    audioStream = anamClient.createAudioPassthroughStream({
      encoding: "pcm_s16le",
      sampleRate: 16000,
      channels: 1,
    });

    // Connect to ElevenLabs
    await connectElevenLabs(config.elevenLabsAgentId, {
      onReady: () => {
        setConnected(true);
        addMessage("system", "Connected. Start speaking...");
      },
      onAudio: (audio) => {
        audioStream?.sendAudioChunk(audio);
      },
      onUserTranscript: (text) => addMessage("user", text),
      onAgentResponse: (text) => {
        audioStream?.endOfSpeech();
        addMessage("agent", text);
      },
      onInterrupt: () => {
        anamClient?.interruptPersona();
      },
      onDisconnect: () => setConnected(false),
      onError: () => showError("Connection error"),
    });
  } catch (error) {
    showError(error instanceof Error ? error.message : "Failed to start");
    btnText.textContent = "Start Conversation";
    showVideo(false);
  } finally {
    connectBtn.disabled = false;
  }
}

async function stop() {
  stopElevenLabs();
  await anamClient?.stopStreaming();
  anamClient = null;
  audioStream = null;
  showVideo(false);
  setConnected(false);
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

connectBtn.addEventListener("click", () => {
  isConnected ? stop() : start();
});

window.addEventListener("beforeunload", stop);

console.log("ElevenLabs + Anam Demo ready");
