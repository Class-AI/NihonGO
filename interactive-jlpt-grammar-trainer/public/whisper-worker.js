/* Whisper speech-to-text worker (open-source OpenAI Whisper, ONNX, runs ON THE DEVICE via transformers.js).
 * Loaded as a module worker from /whisper-worker.js. Model files come from Hugging Face and are cached by
 * the browser, so after the first download it works offline — also inside the installed APK.
 */
const LIBS = [
  "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1",
  "https://unpkg.com/@huggingface/transformers@3.8.1/dist/transformers.min.js",
];

let lib = null;
let asr = null;
let loadedModel = "";
let loading = null;

async function getLib() {
  if (lib) return lib;
  let lastErr;
  for (const url of LIBS) {
    try {
      lib = await import(url);
      lib.env.allowLocalModels = false;
      lib.env.useBrowserCache = true;
      try {
        lib.env.backends.onnx.wasm.numThreads = 1; // works everywhere (no cross-origin isolation needed)
      } catch (e) {}
      return lib;
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error("Could not download the speech engine (check internet once): " + (lastErr && lastErr.message ? lastErr.message : lastErr));
}

async function load(model, id) {
  if (asr && loadedModel === model) return;
  if (loading && loading.model === model) return loading.promise;
  const promise = (async () => {
    const { pipeline } = await getLib();
    asr = null;
    const files = {};
    const progress_callback = (p) => {
      if (p && p.status === "progress" && p.file) {
        files[p.file] = { loaded: p.loaded || 0, total: p.total || 0 };
        let l = 0;
        let t = 0;
        for (const k in files) {
          l += files[k].loaded;
          t += files[k].total;
        }
        self.postMessage({ type: "progress", id, loaded: l, total: t, pct: t ? Math.min(99, Math.round((l / t) * 100)) : 0 });
      }
    };
    asr = await pipeline("automatic-speech-recognition", model, { device: "wasm", dtype: "q8", progress_callback });
    loadedModel = model;
    self.postMessage({ type: "ready", id, model });
  })();
  loading = { model, promise };
  try {
    await promise;
  } finally {
    loading = null;
  }
}

self.onmessage = async (e) => {
  const m = e.data || {};
  try {
    if (m.type === "load") {
      await load(m.model, m.id);
    } else if (m.type === "transcribe") {
      await load(m.model, m.id);
      const out = await asr(m.audio, {
        language: "japanese",
        task: "transcribe",
        chunk_length_s: 30,
        return_timestamps: false,
        num_beams: 1,
      });
      self.postMessage({ type: "result", id: m.id, text: String((out && out.text) || "").trim() });
    }
  } catch (err) {
    self.postMessage({ type: "error", id: m.id, message: String((err && err.message) || err) });
  }
};
