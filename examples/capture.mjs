import { writeFile } from 'node:fs/promises';

const [url, output = 'capture.png'] = process.argv.slice(2);
const apiKey = process.env.LATCHSHOT_API_KEY;

if (!url || !apiKey) {
  console.error('Usage: LATCHSHOT_API_KEY=... node examples/capture.mjs URL [OUTPUT.png]');
  process.exit(2);
}

const response = await fetch('https://latchshot.fly.dev/v1/render', {
  method: 'POST',
  headers: {
    authorization: `Bearer ${apiKey}`,
    'content-type': 'application/json',
  },
  body: JSON.stringify({ url, format: 'png', width: 1440, height: 900 }),
  signal: AbortSignal.timeout(45_000),
});

if (!response.ok) {
  throw new Error(`Latchshot returned HTTP ${response.status}: ${await response.text()}`);
}

const bytes = new Uint8Array(await response.arrayBuffer());
await writeFile(output, bytes, { flag: 'wx' });
console.log(JSON.stringify({
  output,
  bytes: bytes.byteLength,
  renderMs: response.headers.get('x-latchshot-render-ms'),
  remaining: response.headers.get('x-quota-remaining'),
}));
