import { readFile } from 'node:fs/promises';

const spec = JSON.parse(await readFile(new URL('../openapi.json', import.meta.url), 'utf8'));
const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
const migrationForm = await readFile(new URL('../.github/ISSUE_TEMPLATE/migration-fit.yml', import.meta.url), 'utf8');
const migrationPaths = [
  '/migrate.md',
  '/guides/migrate-from-apiflash.html',
  '/guides/migrate-from-screenshotmachine.html',
  '/guides/migrate-from-screenshotone.html',
  '/guides/migrate-from-urlbox.html',
];

const required = [
  [spec.openapi === '3.1.0', 'OpenAPI version must remain 3.1.0'],
  [spec.info?.title === 'Latchshot API', 'API title is missing'],
  [spec.info?.license?.identifier === 'LicenseRef-Proprietary', 'hosted-service license boundary is missing'],
  [spec.servers?.some(({ url }) => url === 'https://latchshot.fly.dev'), 'production server is missing'],
  [spec.paths?.['/api/trials']?.post?.security?.length === 0, 'Free-plan issuance must remain unauthenticated'],
  [spec.paths?.['/v1/render']?.post?.security?.[0]?.bearerAuth, 'render endpoint must require Bearer auth'],
  [spec.paths?.['/v1/usage']?.get?.security?.[0]?.bearerAuth, 'usage endpoint must require Bearer auth'],
  [spec.paths?.['/v1/upgrade-requests']?.post?.security?.[0]?.bearerAuth, 'upgrade endpoint must require Bearer auth'],
  [['blockAds', 'blockTrackers', 'hideCookieBanners'].every((name) => spec.components?.schemas?.RenderRequest?.properties?.[name]?.type === 'boolean'), 'bounded cleanup controls are missing from the render contract'],
  [spec.components?.schemas?.RenderRequest?.properties?.quality?.minimum === 1 && spec.components?.schemas?.RenderRequest?.properties?.quality?.maximum === 100, 'bounded JPEG quality is missing from the render contract'],
  [readme.includes('?intent=githubcore#trial'), 'README Free-plan link must preserve repository attribution'],
  [migrationPaths.every((path) => readme.includes(`https://latchshot.fly.dev${path}`)), 'README provider migration index is incomplete'],
  [readme.includes("Keep the current provider for every job that depends on a guide's stop list."), 'README migration stop-list boundary is missing'],
  [readme.includes('block known third-party ad/tracker hosts') && readme.includes('without accepting consent'), 'README cleanup boundary is missing'],
  [readme.includes('issues/new?template=migration-fit.yml'), 'README migration-fit path is missing'],
  [migrationForm.includes('This is a public issue.') && migrationForm.includes('Never include an API key'), 'migration form public safety warning is missing'],
  [migrationForm.includes('Provider behavior that must be preserved'), 'migration form stop-list qualification is missing'],
  [migrationForm.includes('Expected successful captures per UTC month'), 'migration form volume qualification is missing'],
  [readme.includes('The hosted renderer source is not published here.'), 'repository scope boundary is missing'],
  [!readme.includes('ls_live_') || readme.includes("ls_live_replace_me"), 'README may contain an API key'],
];

const failed = required.filter(([ok]) => !ok).map(([, message]) => message);
if (failed.length) {
  throw new Error(failed.join('\n'));
}

console.log('Latchshot public contract validation passed.');
