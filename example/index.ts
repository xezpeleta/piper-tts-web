import * as tts from '../src';
// @ts-ignore-next-line
import Worker from './worker.ts?worker';
let worker = new Worker(); // set worker so we can reuse it.

// required for e2e
Object.assign(window, { tts });

document.querySelector('#app')!.innerHTML = `
<label for="prompt">Testua (Basque)</label>
<textarea id="prompt" rows="6">Kaixo! Hau Maider ahotsarekin sortutako proba mezua da. Idatzi nahi duzun testua eta entzuteko sakatu.</textarea>
<button id="btn" type="button">Synthesize</button>

<p>Stored Voices</p>
<ul id="stored">
</ul>
<button id="flush">Flush storage</button>
`

window.onload = () => {
  const listEl = document.getElementById('stored');
  worker.postMessage({ type: 'stored' });
  worker.addEventListener('message', (event: MessageEvent<{ type: 'stored', voiceIds: string[] }>) => {
    if (event.data.type != 'stored') return;
    for (let voice of event.data.voiceIds) {
      let liEl = document.createElement('li');
      liEl.innerText = voice
      listEl?.appendChild(liEl)
    }
  });
}


document.getElementById('flush')?.addEventListener('click', async () => {
  const mainWorker = worker ?? new Worker();
  mainWorker.postMessage({ type: 'flush' });
  setTimeout(() => { window.location.reload() }, 2_000)
});

document.getElementById('btn')?.addEventListener('click', async () => {
  const mainWorker = worker ?? new Worker();
  const prompt = (document.getElementById('prompt') as HTMLTextAreaElement | null)?.value;
  mainWorker.postMessage({
    type: 'init',
    text: prompt?.trim() || 'Kaixo! Hau Maider ahotsarekin sortutako proba mezua da.',
    voiceId: 'eu-maider-medium',
  });
});

// Listen for messages over and over on this index.
worker.addEventListener('message', (event: MessageEvent<{ type: 'result', audio: Blob } | { type: 'error', message: string }>) => {
  console.log(event)
  if (event.data.type === 'error') return console.error(event.data.message);
  if (event.data.type != 'result') return;

  const audio = new Audio();
  audio.src = URL.createObjectURL(event.data.audio);
  audio.play();
});
