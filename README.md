# ElevenLabs Agents + Anam Avatar Demo

A demonstration of integrating [ElevenLabs Conversational AI](https://elevenlabs.io/conversational-ai) with [Anam](https://anam.ai) avatars using **audio passthrough mode**. ElevenLabs handles the conversational AI (speech recognition, LLM, and voice synthesis), while Anam provides real-time avatar lip-sync visualization.

## How It Works

```
┌─────────────┐     WebSocket      ┌─────────────┐
│   Browser   │◄──────────────────►│  ElevenLabs │
│             │   (bidirectional)  │   Agent     │
│  ┌───────┐  │                    └─────────────┘
│  │  Mic  │──┼── user audio ──────────►
│  └───────┘  │
│             │◄── agent audio (PCM16) ─┐
│  ┌───────┐  │                         │
│  │ Anam  │◄─┼─────────────────────────┘
│  │Avatar │  │   (audio passthrough)
│  └───────┘  │
└─────────────┘
```

### The Flow

1. **User speaks** → Microphone captures audio at 16kHz
2. **Audio sent to ElevenLabs** → Via WebSocket as base64-encoded PCM16
3. **ElevenLabs processes** → Speech-to-text → LLM → Text-to-speech
4. **Agent audio returned** → PCM16 chunks arrive faster than realtime
5. **Audio sent to Anam** → Via `createAudioPassthroughStream()` for lip-sync
6. **Avatar animates** → Anam renders lip-sync in sync with the audio

### Key Concept: Audio Passthrough

In **avatarOnly** mode, Anam doesn't use its own AI—it just renders an avatar that lip-syncs to audio you provide. This lets you use any external voice source (like ElevenLabs) while getting high-quality avatar visualization.

```typescript
// Create Anam session in avatarOnly mode
const anamClient = createClient(sessionToken);
await anamClient.streamToVideoElement("video-element");

// Create audio passthrough stream
const audioStream = anamClient.createAudioPassthroughStream({
  encoding: "pcm_s16le",
  sampleRate: 16000,
  channels: 1,
});

// Send audio chunks as they arrive from ElevenLabs
audioStream.sendAudioChunk(base64AudioData);

// Signal end of speech for proper lip-sync timing
audioStream.endOfSpeech();
```

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) runtime
- [ElevenLabs](https://elevenlabs.io) account with a configured Agent
- [Anam](https://anam.ai) account with API access

### 1. Clone and install

```bash
git clone <repo-url>
cd agent_11labs
bun install
```

### 2. Configure environment

Create a `.dev.vars` file in the project root:

```env
ANAM_API_KEY=your_anam_api_key
ANAM_AVATAR_ID=your_avatar_id
ELEVENLABS_AGENT_ID=your_agent_id
```

### 3. Run the development server

```bash
bun run dev
```

### 4. Open in browser

Navigate to `http://localhost:5173` and click **Start Conversation**.

## Project Structure

```
src/
├── client.ts          # Main client orchestration
├── elevenlabs.ts      # ElevenLabs WebSocket & mic handling
├── index.ts           # Hono server entry point
├── renderer.tsx       # HTML template renderer
└── routes/
    ├── index.tsx      # Main page UI
    └── api/
        └── config.ts  # Server-side config endpoint
```

## Architecture Details

### Server (`src/routes/api/config.ts`)

The server handles sensitive API keys and creates Anam session tokens:

```typescript
// Creates an Anam session in avatarOnly mode
const response = await fetch("https://api.anam.ai/v1/auth/session-token", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${anamApiKey}`,
  },
  body: JSON.stringify({
    personaConfig: {
      avatarId: avatarId,
      avatarOnly: true,  // No Anam AI, just avatar rendering
    },
  }),
});
```

### ElevenLabs Integration (`src/elevenlabs.ts`)

Connects to ElevenLabs via WebSocket and handles:
- Microphone capture at 16kHz with echo cancellation
- Sending user audio as base64-encoded PCM16
- Receiving agent audio chunks
- Handling interruptions (barge-in)

### Client Orchestration (`src/client.ts`)

Coordinates between ElevenLabs and Anam:

```typescript
// When ElevenLabs sends audio
onAudio: (audio) => {
  audioStream?.sendAudioChunk(audio);
},

// When agent finishes a response
onAgentResponse: (text) => {
  audioStream?.endOfSpeech();
},

// When user interrupts (barge-in)
onInterrupt: () => {
  anamClient?.interruptPersona();
},
```

## Environment Variables

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `ANAM_API_KEY` | Anam API key | [lab.anam.ai](https://lab.anam.ai) → Settings → API Keys |
| `ANAM_AVATAR_ID` | Avatar to render | [lab.anam.ai](https://lab.anam.ai) → Avatars |
| `ELEVENLABS_AGENT_ID` | ElevenLabs Agent ID | [elevenlabs.io](https://elevenlabs.io) → Agents |

## ElevenLabs Agent Configuration

When setting up your ElevenLabs agent, configure the output audio format:

- **Format**: PCM 16-bit
- **Sample Rate**: 16000 Hz
- **Channels**: Mono

This matches what Anam expects for lip-sync.

## Handling Interruptions

When a user starts speaking while the agent is talking (barge-in), ElevenLabs sends an `interruption` event. The demo handles this by calling `anamClient.interruptPersona()` to immediately stop the avatar's lip-sync animation.

## Deployment

This project is configured for [Cloudflare Workers](https://workers.cloudflare.com/):

```bash
# Build and deploy
bun run deploy
```

Make sure to set your environment variables in the Cloudflare dashboard or via `wrangler secret put`.

## Dependencies

- **[@anam-ai/js-sdk](https://www.npmjs.com/package/@anam-ai/js-sdk)** - Anam avatar SDK
- **[chatdio](https://www.npmjs.com/package/chatdio)** - Audio utilities (mic capture, format conversion)
- **[hono](https://hono.dev)** - Lightweight web framework

## Resources

- [ElevenLabs Conversational AI Docs](https://elevenlabs.io/docs/conversational-ai/overview)
- [Anam Documentation](https://docs.anam.ai)
- [ElevenLabs WebSocket Protocol](https://elevenlabs.io/docs/conversational-ai/api-reference)

## License

MIT
