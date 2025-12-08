# ElevenLabs + Anam Integration Demo

A demo showing how to integrate ElevenLabs Conversational AI with Anam's avatar lip-sync using the `enableAudioPassthrough` feature.

## Architecture

- **ElevenLabs**: Handles conversational AI (LLM + voice synthesis)
- **Anam**: Renders the avatar with lip-sync to the audio

## Setup

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment

Create a `.dev.vars` file:

```
ANAM_API_KEY=your_anam_api_key
ANAM_AVATAR_ID=edf6fdcb-acab-44b8-b974-ded72665ee26
ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id
```

### 3. Run development server

```bash
bun run dev
```

### 4. Open in browser

Navigate to `http://localhost:5173` and click "Start Conversation".

## How It Works

1. Server fetches Anam session token with `enableAudioPassthrough: true`
2. Client initializes Anam avatar streaming
3. Client starts ElevenLabs conversation with the configured agent
4. ElevenLabs `onAudio` callback receives base64 audio chunks
5. Audio is decoded and routed to Anam for lip-sync

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANAM_API_KEY` | Your Anam API key from [lab.anam.ai](https://lab.anam.ai) |
| `ANAM_AVATAR_ID` | Avatar ID to use for rendering |
| `ELEVENLABS_AGENT_ID` | Your ElevenLabs Agent ID |

## Resources

- [ElevenLabs Agents Platform](https://elevenlabs.io/docs/agents-platform/overview)
- [Anam SDK Documentation](https://docs.anam.ai)
- [@11labs/client](https://www.npmjs.com/package/@11labs/client)
- [@anam-ai/js-sdk](https://www.npmjs.com/package/@anam-ai/js-sdk)
