// TEMPORARY slice-screenshot engine — safe to delete.
// Renders each slice variation via /slice-simulator/shot?state=... in headless
// Chrome (CDP over Node's built-in WebSocket — no npm deps), waits for fonts +
// images, then captures the FULL slice height to slices/<Slice>/screenshot-<id>.png.
//
// Usage:
//   node scripts/_capture.mjs <baseUrl> [SliceDir[:variation] ...]
//   node scripts/_capture.mjs http://localhost:57285            # all slices, all variations
//   node scripts/_capture.mjs http://localhost:57285 Hero       # one slice, all variations
//   node scripts/_capture.mjs http://localhost:57285 Hero:backdrop Text:info
import mocksPkg from "../node_modules/.pnpm/@prismicio+mocks@2.14.0/node_modules/@prismicio/mocks/lib/index.js";
import lzPkg from "../node_modules/.pnpm/lz-string@1.5.0/node_modules/lz-string/libs/lz-string.js";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const { renderSliceMock } = mocksPkg;
const LZString = lzPkg;

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const WIDTH = 1280;
const SCALE = 1; // 1x keeps committed screenshots lean; plenty for thumbnails
const baseUrl = process.argv[2] || "http://localhost:57285";
const filters = process.argv.slice(3); // e.g. "Hero" or "Hero:backdrop"

const SLICES_DIR = "slices";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- build the work list from model.json + mocks.json -----------------------
function buildJobs() {
  const dirs = fs
    .readdirSync(SLICES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  const jobs = [];
  for (const dir of dirs) {
    const modelPath = path.join(SLICES_DIR, dir, "model.json");
    const mocksPath = path.join(SLICES_DIR, dir, "mocks.json");
    if (!fs.existsSync(modelPath) || !fs.existsSync(mocksPath)) continue;
    const model = JSON.parse(fs.readFileSync(modelPath, "utf8"));
    const mocks = JSON.parse(fs.readFileSync(mocksPath, "utf8"));
    for (const variation of model.variations) {
      const mock = mocks.find((m) => m.variation === variation.id);
      if (!mock) {
        console.warn(`  ! ${dir}/${variation.id}: no mock, skipping`);
        continue;
      }
      // honor filters
      if (filters.length) {
        const ok = filters.some((f) => {
          const [fd, fv] = f.split(":");
          return fd === dir && (!fv || fv === variation.id);
        });
        if (!ok) continue;
      }
      const api = renderSliceMock(model, mock);
      const state = LZString.compressToEncodedURIComponent(JSON.stringify([api]));
      jobs.push({
        dir,
        variation: variation.id,
        url: `${baseUrl}/slice-simulator/shot?state=${state}`,
        out: path.join(SLICES_DIR, dir, `screenshot-${variation.id}.png`),
      });
    }
  }
  return jobs;
}

// ---- minimal CDP client over Node's global WebSocket ------------------------
class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.listeners = new Map();
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
      } else if (msg.method) {
        (this.listeners.get(msg.method) || []).forEach((cb) => cb(msg.params));
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  once(method) {
    return new Promise((resolve) => {
      const cb = (p) => {
        const arr = this.listeners.get(method);
        this.listeners.set(method, arr.filter((f) => f !== cb));
        resolve(p);
      };
      const arr = this.listeners.get(method) || [];
      arr.push(cb);
      this.listeners.set(method, arr);
    });
  }
}

async function connectWS(url) {
  const ws = new WebSocket(url);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  return ws;
}

async function main() {
  const jobs = buildJobs();
  if (!jobs.length) {
    console.error("No jobs matched.");
    process.exit(1);
  }
  console.log(`Capturing ${jobs.length} slice screenshots @ ${WIDTH}px x${SCALE} ...`);

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "shot-chrome-"));
  const port = 9333;
  const chrome = spawn(CHROME, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${userDataDir}`,
    `--remote-debugging-port=${port}`,
    "about:blank",
  ]);
  chrome.stderr.on("data", () => {}); // swallow noise

  // wait for the debugging endpoint
  let wsBrowser;
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://localhost:${port}/json/version`);
      wsBrowser = (await res.json()).webSocketDebuggerUrl;
      if (wsBrowser) break;
    } catch {}
    await sleep(200);
  }
  if (!wsBrowser) throw new Error("Chrome debugging endpoint never came up");

  const browser = new CDP(await connectWS(wsBrowser));
  const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });

  // a session-scoped CDP: wrap send to include sessionId
  const rawWs = browser.ws;
  const session = new CDP(rawWs);
  session.send = (method, params = {}) => {
    const id = ++session.id;
    return new Promise((resolve, reject) => {
      session.pending.set(id, { resolve, reject });
      rawWs.send(JSON.stringify({ id, sessionId, method, params }));
    });
  };
  // route session-scoped events (they carry the sessionId) to `session`
  rawWs.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.sessionId === sessionId && msg.method) {
      (session.listeners.get(msg.method) || []).forEach((cb) => cb(msg.params));
    }
  });

  await session.send("Page.enable");
  await session.send("Runtime.enable");

  // Preflight: make sure the dev server is actually serving the shot route, so a
  // dead/errored server can't silently overwrite good screenshots with error pages.
  try {
    const res = await fetch(jobs[0].url);
    const body = await res.text();
    if (!res.ok || /couldn.?t load|Internal Server Error|Application error/i.test(body)) {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (e) {
    chrome.kill();
    throw new Error(`Preflight failed against ${baseUrl} (${e.message}). Is the dev server up? Aborting so screenshots aren't clobbered.`);
  }

  const results = [];
  for (const job of jobs) {
    try {
      // Load + wait + measure, retried once to survive transient blanks / cold compiles.
      let found = false, bottom = 0, err = false;
      for (let attempt = 1; attempt <= 2 && !found; attempt++) {
        // Set the real capture width BEFORE loading so responsive layout (and thus
        // measured height) reflects the 1280px breakpoint, not the headless default.
        await session.send("Emulation.setDeviceMetricsOverride", {
          width: WIDTH,
          height: 900, // working "fold" — viewport-bound slices capture at this
          deviceScaleFactor: SCALE,
          mobile: false,
        });
        const loaded = session.once("Page.loadEventFired");
        await session.send("Page.navigate", { url: job.url });
        await Promise.race([loaded, sleep(15000)]);

        // Time-bounded wait: let React render, wait for images, hide dev badge, settle.
        await session.send("Runtime.evaluate", {
          awaitPromise: true,
          expression: `(async () => {
            const nap = (ms) => new Promise(r => setTimeout(r, ms));
            const s = document.createElement('style');
            s.textContent = 'nextjs-portal,[data-nextjs-dev-tools-button],#__next-dev-tools-indicator,[data-next-badge-root],[data-nextjs-toast]{display:none!important;}';
            document.head.appendChild(s);
            try { await Promise.race([document.fonts.ready, nap(4000)]); } catch {}
            const start = Date.now();
            await nap(1200);
            while (Date.now() - start < 8000) {
              const imgs = [...document.images];
              const allOk = imgs.length > 0 && imgs.every(i => i.complete && i.naturalWidth > 0);
              const noneExpected = imgs.length === 0 && Date.now() - start > 2500;
              if (allOk || noneExpected) break;
              await nap(150);
            }
            await nap(400);
          })()`,
        });

        // The shot route renders ONLY the slice, so the true content height is the
        // lowest rendered element. (Section doesn't forward data-slice-type; the Next
        // dev badge is CSS-hidden — neither skews this.)
        const { result } = await session.send("Runtime.evaluate", {
          expression: `(() => {
            let bottom = 0;
            for (const e of document.body.querySelectorAll('*')) {
              const b = Math.ceil(e.getBoundingClientRect().bottom);
              if (b > bottom) bottom = b;
            }
            const text = document.body.innerText.trim();
            const err = /couldn.?t load|Internal Server Error|Application error/i.test(text);
            // height-based: image-only slices have no innerText but do render.
            const found = bottom > 120 && !err;
            return JSON.stringify({ found, bottom, err });
          })()`,
          returnByValue: true,
        });
        ({ found, bottom, err } = JSON.parse(result.value));
        if (process.env.DEBUG_SHOT) {
          const dbg = await session.send("Runtime.evaluate", {
            expression: `JSON.stringify({bodyLen:document.body.innerText.length, firstText:document.body.innerText.slice(0,80)})`,
            returnByValue: true,
          });
          console.error(`    DEBUG a${attempt}:`, dbg.result.value);
        }
        if (!found && attempt < 2) await sleep(900); // brief pause, then retry
      }
      if (!found) {
        // Slice rendered nothing (null / data-driven / error) — do NOT overwrite.
        console.error(`  ⚠ ${job.dir}/${job.variation}: no slice rendered${err ? " (error page)" : ""}; kept existing file`);
        results.push({ ...job, ok: false, error: err ? "error page" : "empty render" });
        continue;
      }
      const height = Math.max(320, Math.min(bottom, 6000));

      await session.send("Emulation.setDeviceMetricsOverride", {
        width: WIDTH,
        height,
        deviceScaleFactor: SCALE,
        mobile: false,
      });

      const shot = await session.send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: WIDTH, height, scale: 1 },
      });
      fs.writeFileSync(job.out, Buffer.from(shot.data, "base64"));
      console.log(`  ✓ ${job.dir}/${job.variation}  (${WIDTH}x${height})  -> ${job.out}`);
      results.push({ ...job, height, ok: true });
    } catch (e) {
      console.error(`  ✗ ${job.dir}/${job.variation}: ${e.message}`);
      results.push({ ...job, ok: false, error: e.message });
    }
  }

  chrome.kill();
  try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
  const ok = results.filter((r) => r.ok).length;
  console.log(`\nDone: ${ok}/${results.length} captured.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
