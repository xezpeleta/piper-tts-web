import './styles.css';
import * as tts from '../src';
import { createElement, icons } from 'lucide';
// @ts-ignore-next-line
import Worker from './worker.ts?worker';

const DEFAULT_TEXT = 'Kaixo! Hau Maider ahotsarekin sortutako proba mezua da. Idatzi nahi duzun testua eta entzuteko sakatu.';
const VOICE_ID = 'eu-maider-medium';

const worker = new Worker();

// required for e2e
Object.assign(window, { tts });

document.querySelector('#app')!.innerHTML = `
  <main class="min-h-screen bg-ink-950 text-white">
    <div class="pointer-events-none absolute inset-0 bg-hero-glow opacity-90"></div>
    <div class="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-12">
      <header class="flex flex-col gap-6">
        <div class="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
          <span class="inline-flex h-2 w-2 rounded-full bg-violet-400 shadow-glow"></span>
          Basque voice demo
        </div>
        <div class="flex flex-col gap-4">
          <h1 class="font-display text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">Maider TTS Studio</h1>
          <p class="max-w-2xl text-base text-white/70 sm:text-lg">Generate natural Basque speech with the Maider Piper model. Customize the text, track model download progress, and export the audio.</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <span class="rounded-full border border-violet-400/40 bg-violet-500/15 px-4 py-1 text-sm text-violet-200">Voice: Maider (female)</span>
          <span class="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-white/70">Quality: Medium</span>
          <span class="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-white/70">Language: Euskara</span>
        </div>
      </header>

      <section class="grid gap-6 lg:grid-cols-[minmax(0,_1.3fr)_minmax(0,_0.7fr)]">
        <div class="glass-card flex flex-col gap-6 rounded-3xl p-6 sm:p-8">
          <div class="flex flex-col gap-2">
            <label for="prompt" class="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Testua</label>
            <textarea id="prompt" rows="7" class="control-ring w-full rounded-2xl border border-white/10 bg-ink-900/80 px-4 py-3 text-base text-white/90 placeholder:text-white/40">${DEFAULT_TEXT}</textarea>
            <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-white/50">
              <span id="helper">Basque input recommended for the best results.</span>
              <span id="charCount">0 characters</span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button id="generate" class="button-primary" type="button">
              <span id="generateIcon"></span>
              <span id="generateLabel">Generate</span>
            </button>
            <button id="reset" class="button-secondary" type="button">
              <span id="resetIcon"></span>
              Reset text
            </button>
            <button id="flush" class="button-secondary" type="button">
              <span id="flushIcon"></span>
              Clear storage
            </button>
          </div>

          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between text-sm text-white/70">
              <span id="statusLabel">Idle</span>
              <span id="statusDetail">Model ready</span>
            </div>
            <div class="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div id="progressBar" class="h-full w-0 rounded-full bg-gradient-to-r from-violet-400 via-violet-500 to-blush-500 transition-all"></div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-6">
          <div class="glass-card flex flex-col gap-4 rounded-3xl p-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-sm font-semibold text-white/80">
                <span id="audioIcon"></span>
                Latest render
              </div>
              <span id="renderState" class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">No audio yet</span>
            </div>
            <audio id="player" class="w-full" controls></audio>
            <button id="download" class="button-secondary" type="button" disabled>
              <span id="downloadIcon"></span>
              Download audio
            </button>
          </div>

          <div class="glass-card flex flex-col gap-4 rounded-3xl p-6">
            <div class="flex items-center justify-between">
              <div class="text-sm font-semibold text-white/80">Stored voices</div>
              <span id="storedCount" class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">0</span>
            </div>
            <ul id="stored" class="space-y-2 text-sm text-white/60"></ul>
          </div>
        </div>
      </section>
    </div>
  </main>
`;

const promptEl = document.getElementById('prompt') as HTMLTextAreaElement | null;
const charCountEl = document.getElementById('charCount');
const statusLabelEl = document.getElementById('statusLabel');
const statusDetailEl = document.getElementById('statusDetail');
const progressBarEl = document.getElementById('progressBar');
const generateButton = document.getElementById('generate') as HTMLButtonElement | null;
const generateLabel = document.getElementById('generateLabel');
const renderStateEl = document.getElementById('renderState');
const playerEl = document.getElementById('player') as HTMLAudioElement | null;
const downloadButton = document.getElementById('download') as HTMLButtonElement | null;
const storedListEl = document.getElementById('stored');
const storedCountEl = document.getElementById('storedCount');

const generateIconEl = document.getElementById('generateIcon');
const resetIconEl = document.getElementById('resetIcon');
const flushIconEl = document.getElementById('flushIcon');
const audioIconEl = document.getElementById('audioIcon');
const downloadIconEl = document.getElementById('downloadIcon');

function mountIcon(container: HTMLElement | null, node: Element) {
  if (!container) return;
  container.innerHTML = '';
  container.appendChild(node);
}

function renderIcon(
  name: keyof typeof icons,
  attrs: { size?: number; class?: string } = {}
) {
  return createElement(icons[name], attrs);
}

mountIcon(generateIconEl, renderIcon('sparkles', { size: 18 }));
mountIcon(resetIconEl, renderIcon('refreshCcw', { size: 16 }));
mountIcon(flushIconEl, renderIcon('refreshCcw', { size: 16 }));
mountIcon(audioIconEl, renderIcon('volume2', { size: 16 }));
mountIcon(downloadIconEl, renderIcon('download', { size: 16 }));

let audioUrl: string | null = null;
let isGenerating = false;
let isDownloading = false;

function updateCharCount() {
  if (!promptEl || !charCountEl) return;
  const value = promptEl.value.trim();
  charCountEl.textContent = `${value.length} characters`;
}

function setStatus(label: string, detail: string) {
  if (statusLabelEl) statusLabelEl.textContent = label;
  if (statusDetailEl) statusDetailEl.textContent = detail;
}

function setProgress(value: number) {
  if (!progressBarEl) return;
  const normalized = Math.max(0, Math.min(100, value));
  progressBarEl.style.width = `${normalized}%`;
}

function setButtonsDisabled(disabled: boolean) {
  if (generateButton) generateButton.disabled = disabled;
  if (promptEl) promptEl.disabled = disabled;
}

function setGenerateState(state: 'idle' | 'downloading' | 'generating') {
  isDownloading = state === 'downloading';
  isGenerating = state === 'generating';
  const disabled = state !== 'idle';
  setButtonsDisabled(disabled);

  if (!generateLabel) return;
  if (!generateIconEl) return;

  if (state === 'downloading') {
    generateLabel.textContent = 'Downloading model...';
    mountIcon(generateIconEl, renderIcon('loader2', { size: 18, class: 'animate-spin' }));
    setStatus('Downloading', 'Fetching model assets');
  } else if (state === 'generating') {
    generateLabel.textContent = 'Generating...';
    mountIcon(generateIconEl, renderIcon('loader2', { size: 18, class: 'animate-spin' }));
    setStatus('Generating', 'Synthesizing audio');
  } else {
    generateLabel.textContent = 'Generate';
    mountIcon(generateIconEl, renderIcon('sparkles', { size: 18 }));
    setStatus('Idle', 'Model ready');
  }
}

function setRenderState(label: string, variant: 'idle' | 'ready' | 'error') {
  if (!renderStateEl) return;
  renderStateEl.textContent = label;
  renderStateEl.className = 'rounded-full border px-3 py-1 text-xs';
  if (variant === 'ready') {
    renderStateEl.className += ' border-violet-300/40 bg-violet-500/20 text-violet-100';
  } else if (variant === 'error') {
    renderStateEl.className += ' border-blush-500/40 bg-blush-500/20 text-blush-200';
  } else {
    renderStateEl.className += ' border-white/10 bg-white/5 text-white/60';
  }
}

function setAudio(blob: Blob) {
  if (!playerEl) return;
  if (audioUrl) {
    URL.revokeObjectURL(audioUrl);
  }
  audioUrl = URL.createObjectURL(blob);
  playerEl.src = audioUrl;
  playerEl.load();
  downloadButton?.removeAttribute('disabled');
  setRenderState('Ready to play', 'ready');
}

function handleError(message: string) {
  setGenerateState('idle');
  setProgress(0);
  setStatus('Error', message);
  setRenderState('Something went wrong', 'error');
}

function updateStoredList(voices: string[]) {
  if (!storedListEl) return;
  storedListEl.innerHTML = '';
  for (const voice of voices) {
    const item = document.createElement('li');
    item.className = 'rounded-2xl border border-white/5 bg-white/5 px-3 py-2';
    item.textContent = voice;
    storedListEl.appendChild(item);
  }
  if (storedCountEl) storedCountEl.textContent = `${voices.length}`;
}

function parseProgressMessage(message: string) {
  try {
    const data = JSON.parse(message) as { loaded?: number; total?: number };
    if (typeof data.loaded === 'number' && typeof data.total === 'number') {
      const pct = data.total === 0 ? 0 : (data.loaded / data.total) * 100;
      setGenerateState('downloading');
      setProgress(pct);
      setStatus('Downloading', `${Math.round(pct)}% complete`);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

updateCharCount();

promptEl?.addEventListener('input', updateCharCount);

document.getElementById('reset')?.addEventListener('click', () => {
  if (!promptEl) return;
  promptEl.value = DEFAULT_TEXT;
  updateCharCount();
});

document.getElementById('flush')?.addEventListener('click', () => {
  worker.postMessage({ type: 'flush' });
  setTimeout(() => { window.location.reload() }, 2_000);
});

downloadButton?.addEventListener('click', () => {
  if (!audioUrl) return;
  const anchor = document.createElement('a');
  anchor.href = audioUrl;
  anchor.download = 'maider-output.wav';
  anchor.click();
});

generateButton?.addEventListener('click', () => {
  if (!promptEl) return;
  const text = promptEl.value.trim();
  if (!text) return;
  setGenerateState(isDownloading ? 'downloading' : 'generating');
  setRenderState('Generating...', 'idle');
  worker.postMessage({
    type: 'init',
    text,
    voiceId: VOICE_ID,
  });
});

worker.postMessage({ type: 'stored' });
worker.addEventListener('message', (event: MessageEvent) => {
  if (typeof event.data === 'string') {
    if (parseProgressMessage(event.data)) return;
  }

  const payload = event.data as { type?: string; audio?: Blob; message?: string; voiceIds?: string[] };

  if (payload?.type === 'stored' && Array.isArray(payload.voiceIds)) {
    updateStoredList(payload.voiceIds);
    return;
  }

  if (payload?.type === 'error') {
    handleError(payload.message || 'Unknown error');
    return;
  }

  if (payload?.type === 'result' && payload.audio instanceof Blob) {
    setGenerateState('idle');
    setProgress(100);
    setStatus('Ready', 'Audio generated');
    setAudio(payload.audio);
    return;
  }

  if (typeof event.data === 'string') {
    if (event.data.includes('Reusing session') || event.data.includes('New session')) {
      setStatus('Preparing', event.data);
    }
  }
});
