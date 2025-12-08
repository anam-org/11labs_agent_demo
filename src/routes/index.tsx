import { Context } from "hono";

export const Index = (c: Context) => {
  return c.render(
    <>
      {/* Background gradient */}
      <div class="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      <div class="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-labs-900/20 via-transparent to-transparent" />

      {/* Main container */}
      <div class="relative min-h-screen flex flex-col items-center justify-center p-4">
        {/* Header */}
        <header class="absolute top-0 left-0 right-0 p-6">
          <div class="flex items-center gap-2 text-zinc-500 text-sm">
            <svg
              class="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span>11labs + Anam Integration Demo</span>
          </div>
        </header>

        {/* Main card */}
        <main class="w-full max-w-lg">
          {/* Avatar video area */}
          <div
            id="avatar-container"
            class="relative aspect-square max-w-xs mx-auto mb-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 overflow-hidden"
          >
            {/* Video element for Anam avatar */}
            <video
              id="anam-video"
              class="absolute inset-0 w-full h-full object-cover hidden"
              autoplay
              playsinline
            />

            {/* Placeholder when not streaming */}
            <div
              id="avatar-placeholder"
              class="absolute inset-0 flex flex-col items-center justify-center text-zinc-600"
            >
              <div id="status-ring" class="relative w-24 h-24 mb-4">
                {/* Outer ring */}
                <div
                  id="outer-ring"
                  class="absolute inset-0 rounded-full border-2 border-zinc-700 transition-colors duration-300"
                />
                {/* Inner circle with icon */}
                <div class="absolute inset-2 rounded-full bg-zinc-800 flex items-center justify-center">
                  <svg
                    id="status-icon"
                    class="w-8 h-8 text-zinc-500 transition-colors duration-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                    />
                  </svg>
                </div>
                {/* Pulse animation */}
                <div
                  id="pulse-ring"
                  class="absolute inset-0 rounded-full border-2 border-labs-500 opacity-0 transition-opacity duration-300"
                />
              </div>
              <p id="status-text" class="text-sm">
                Disconnected
              </p>
            </div>

            {/* Speaking indicator bars */}
            <div
              id="speaking-bars"
              class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-1 h-8 opacity-0 transition-opacity duration-300"
            >
              <div
                class="w-1 bg-labs-500 rounded-full speaking-indicator"
                style="height: 40%; animation-delay: 0ms"
              />
              <div
                class="w-1 bg-labs-500 rounded-full speaking-indicator"
                style="height: 70%; animation-delay: 100ms"
              />
              <div
                class="w-1 bg-labs-500 rounded-full speaking-indicator"
                style="height: 50%; animation-delay: 200ms"
              />
              <div
                class="w-1 bg-labs-500 rounded-full speaking-indicator"
                style="height: 80%; animation-delay: 300ms"
              />
              <div
                class="w-1 bg-labs-500 rounded-full speaking-indicator"
                style="height: 60%; animation-delay: 400ms"
              />
            </div>
          </div>

          {/* Controls card */}
          <div class="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 space-y-5">
            {/* Connect button */}
            <button
              id="connect-btn"
              class="w-full py-3 px-4 bg-labs-600 hover:bg-labs-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg
                id="btn-icon-mic"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                />
              </svg>
              <svg
                id="btn-icon-stop"
                class="w-4 h-4 hidden"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              <span id="btn-text">Start Conversation</span>
            </button>

            {/* Transcript area */}
            <div class="space-y-2">
              <label class="block text-xs text-zinc-400 uppercase tracking-wider">
                Transcript
              </label>
              <div
                id="transcript"
                class="h-48 overflow-y-auto bg-zinc-800/30 border border-zinc-800 rounded-lg p-4 text-sm space-y-3"
              >
                <p class="text-zinc-500 text-center text-xs">
                  Conversation transcript will appear here...
                </p>
              </div>
            </div>
          </div>

          {/* Error display */}
          <div
            id="error-container"
            class="hidden mt-4 p-4 bg-red-900/20 border border-red-800 rounded-lg"
          >
            <p id="error-text" class="text-red-400 text-sm" />
          </div>
        </main>

        {/* Footer */}
        <footer class="absolute bottom-0 left-0 right-0 p-6 text-center">
          <p class="text-zinc-600 text-xs">
            ElevenLabs Conversational AI + Anam Avatar •{" "}
            <a
              href="https://elevenlabs.io/docs/agents-platform/overview"
              target="_blank"
              class="text-zinc-500 hover:text-labs-400 transition-colors"
            >
              11Labs Docs
            </a>
            {" • "}
            <a
              href="https://docs.anam.ai"
              target="_blank"
              class="text-zinc-500 hover:text-labs-400 transition-colors"
            >
              Anam Docs
            </a>
          </p>
        </footer>
      </div>
    </>
  );
};
