import { readFile } from 'node:fs/promises';

const spec = JSON.parse(await readFile(new URL('../openapi.json', import.meta.url), 'utf8'));
const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');
const migrationForm = await readFile(new URL('../.github/ISSUE_TEMPLATE/migration-fit.yml', import.meta.url), 'utf8');
const implementationPilotForm = await readFile(new URL('../.github/ISSUE_TEMPLATE/implementation-pilot.yml', import.meta.url), 'utf8');
const safetyReviewForm = await readFile(new URL('../.github/ISSUE_TEMPLATE/screenshot-safety-review.yml', import.meta.url), 'utf8');
const powerPlatformDefinition = JSON.parse(await readFile(new URL('../integrations/power-platform/apiDefinition.swagger.json', import.meta.url), 'utf8'));
const powerPlatformProperties = JSON.parse(await readFile(new URL('../integrations/power-platform/apiProperties.json', import.meta.url), 'utf8'));
const powerPlatformReadme = await readFile(new URL('../integrations/power-platform/README.md', import.meta.url), 'utf8');
const migrationPaths = [
  '/migrate.md',
  '/guides/migrate-from-apiflash.html',
  '/guides/migrate-from-screenshotmachine.html',
  '/guides/migrate-from-screenshotone.html',
  '/guides/migrate-from-urlbox.html',
  '/guides/migrate-from-browserless.html',
];

const required = [
  [spec.openapi === '3.1.0', 'OpenAPI version must remain 3.1.0'],
  [spec.info?.title === 'Latchshot API', 'API title is missing'],
  [spec.info?.license?.identifier === 'LicenseRef-Proprietary', 'hosted-service license boundary is missing'],
  [spec.servers?.some(({ url }) => url === 'https://latchshot.fly.dev'), 'production server is missing'],
  [spec.paths?.['/api/trials']?.post?.security?.length === 0, 'Free-plan issuance must remain unauthenticated'],
  [spec.paths?.['/api/pilot-requests']?.post?.security?.length === 0, 'implementation-pilot request must remain unauthenticated'],
  [spec.paths?.['/api/pilot-requests']?.post?.description?.includes('Does not issue an API key, take payment, reserve work, or authorize a repository change.'), 'implementation-pilot no-action boundary is missing'],
  [spec.components?.schemas?.PilotRequest?.required?.includes('replyConsent') && spec.components?.schemas?.PilotRequest?.properties?.startBoundaryAcknowledged?.const === true, 'implementation-pilot consent/start schema is missing'],
  [spec.paths?.['/api/safety-review-requests']?.post?.security?.length === 0, 'screenshot safety-review request must remain unauthenticated'],
  [spec.paths?.['/api/safety-review-requests']?.post?.description?.includes('Does not grant repository access, take payment, reserve work, or authorize a code change.'), 'screenshot safety-review no-action boundary is missing'],
  [spec.components?.schemas?.SafetyReviewRequest?.required?.includes('replyConsent') && spec.components?.schemas?.SafetyReviewRequest?.properties?.startBoundaryAcknowledged?.const === true, 'screenshot safety-review consent/start schema is missing'],
  [spec.paths?.['/v1/render']?.post?.security?.[0]?.bearerAuth, 'render endpoint must require Bearer auth'],
  [spec.paths?.['/v1/usage']?.get?.security?.[0]?.bearerAuth, 'usage endpoint must require Bearer auth'],
  [spec.paths?.['/v1/upgrade-requests']?.post?.security?.[0]?.bearerAuth, 'upgrade endpoint must require Bearer auth'],
  [['blockAds', 'blockTrackers', 'blockChats', 'hideCookieBanners', 'hidePopups'].every((name) => spec.components?.schemas?.RenderRequest?.properties?.[name]?.type === 'boolean'), 'bounded cleanup controls are missing from the render contract'],
  [spec.components?.schemas?.RenderRequest?.properties?.scrollPage?.type === 'boolean', 'bounded scroll control is missing from the render contract'],
  [spec.components?.schemas?.RenderRequest?.properties?.quality?.minimum === 1 && spec.components?.schemas?.RenderRequest?.properties?.quality?.maximum === 100, 'bounded JPEG quality is missing from the render contract'],
  [spec.components?.schemas?.UsageResponse?.properties?.links?.properties?.implementationPilot?.const === 'https://latchshot.fly.dev/implementation-pilot.html', 'authenticated implementation-pilot continuation is missing'],
  [['/v1/screenshot', '/v1/render'].every((path) => {
    const operation = path === '/v1/screenshot' ? spec.paths?.[path]?.get : spec.paths?.[path]?.post;
    const headers = operation?.responses?.['200']?.headers;
    return headers?.['X-Latchshot-Usage-URL']?.$ref === '#/components/headers/UsageUrl'
      && headers?.['X-Latchshot-Paid-Plan-URL']?.$ref === '#/components/headers/PaidPlanUrl'
      && headers?.['X-Latchshot-Implementation-Pilot-URL']?.$ref === '#/components/headers/ImplementationPilotUrl';
  }), 'authenticated render continuation headers are missing'],
  [readme.includes('?intent=githubcore#trial'), 'README Free-plan link must preserve repository attribution'],
  [migrationPaths.every((path) => readme.includes(`https://latchshot.fly.dev${path}`)), 'README provider migration index is incomplete'],
  [readme.includes("Keep the current provider for every job that depends on a guide's stop list."), 'README migration stop-list boundary is missing'],
  [readme.includes('block known third-party ad/tracker/chat hosts') && readme.includes('without clicking, submitting, or accepting consent'), 'README cleanup boundary is missing'],
  [readme.includes('issues/new?template=migration-fit.yml'), 'README migration-fit path is missing'],
  [migrationForm.includes('This is a public issue.') && migrationForm.includes('Never include an API key'), 'migration form public safety warning is missing'],
  [migrationForm.includes('Provider behavior that must be preserved'), 'migration form stop-list qualification is missing'],
  [migrationForm.includes('Browserless'), 'migration form Browserless provider option is missing'],
  [migrationForm.includes('Expected successful captures per UTC month'), 'migration form volume qualification is missing'],
  [readme.includes('issues/new?template=implementation-pilot.yml'), 'README implementation-pilot form path is missing'],
  [readme.includes('https://latchshot.fly.dev/guides/screenshot-api-backend.html'), 'README screenshot API backend guide is missing'],
  [readme.includes('https://latchshot.fly.dev/guides/full-page-screenshot-lazy-loading.html'), 'README lazy full-page guide is missing'],
  [readme.includes('https://latchshot.fly.dev/guides/ssrf-safe-screenshot-api.html'), 'README SSRF-safe screenshot guide is missing'],
  [readme.includes('integrations/power-platform/README.md'), 'README Power Platform preview link is missing'],
  [powerPlatformDefinition.swagger === '2.0', 'Power Platform contract must remain Swagger 2.0'],
  [powerPlatformDefinition.host === 'latchshot.fly.dev' && powerPlatformDefinition.schemes?.length === 1 && powerPlatformDefinition.schemes[0] === 'https', 'Power Platform contract must use the fixed HTTPS production origin'],
  [powerPlatformDefinition.securityDefinitions?.api_key?.type === 'apiKey' && powerPlatformDefinition.securityDefinitions?.api_key?.in === 'header' && powerPlatformDefinition.securityDefinitions?.api_key?.name === 'Authorization', 'Power Platform contract must keep the key in the Authorization header'],
  [Object.values(powerPlatformDefinition.paths ?? {}).flatMap((path) => Object.values(path)).map((operation) => operation.operationId).filter(Boolean).sort().join(',') === 'CaptureScreenshot,GetUsage,RenderPage', 'Power Platform contract must expose exactly the three reviewed actions'],
  [!Object.keys(powerPlatformDefinition.paths ?? {}).some((path) => /trial|upgrade|pilot|payment/i.test(path)), 'Power Platform contract must expose no issuance, upgrade, pilot, or payment action'],
  [powerPlatformDefinition.paths?.['/v1/screenshot']?.get?.parameters?.find(({ name }) => name === 'url')?.required === true, 'Power Platform screenshot URL must remain required'],
  [powerPlatformDefinition.definitions?.RenderRequest?.properties?.width?.minimum === spec.components?.schemas?.RenderRequest?.properties?.width?.minimum && powerPlatformDefinition.definitions?.RenderRequest?.properties?.width?.maximum === spec.components?.schemas?.RenderRequest?.properties?.width?.maximum, 'Power Platform width bounds must match the public API'],
  [powerPlatformDefinition.definitions?.RenderRequest?.properties?.height?.minimum === spec.components?.schemas?.RenderRequest?.properties?.height?.minimum && powerPlatformDefinition.definitions?.RenderRequest?.properties?.height?.maximum === spec.components?.schemas?.RenderRequest?.properties?.height?.maximum, 'Power Platform height bounds must match the public API'],
  [powerPlatformDefinition.definitions?.RenderRequest?.properties?.url?.maxLength === spec.components?.schemas?.RenderRequest?.properties?.url?.maxLength, 'Power Platform URL limit must match the public API'],
  [powerPlatformDefinition.definitions?.RenderRequest?.properties?.timeout?.maximum === spec.components?.schemas?.RenderRequest?.properties?.timeout?.maximum && powerPlatformDefinition.definitions?.RenderRequest?.properties?.delay?.maximum === spec.components?.schemas?.RenderRequest?.properties?.delay?.maximum, 'Power Platform timing bounds must match the public API'],
  [['blockAds', 'blockTrackers', 'blockChats', 'hideCookieBanners', 'hidePopups'].every((name) => powerPlatformDefinition.definitions?.RenderRequest?.properties?.[name]?.type === 'boolean'), 'Power Platform bounded cleanup controls are incomplete'],
  [powerPlatformProperties.properties?.connectionParameters?.api_key?.type === 'securestring' && powerPlatformProperties.properties?.connectionParameters?.api_key?.uiDefinition?.constraints?.clearText === false, 'Power Platform connection key must remain a hidden secure string'],
  [powerPlatformProperties.properties?.connectionParameters?.api_key?.uiDefinition?.description?.includes('Bearer '), 'Power Platform connection instructions must include the Bearer prefix'],
  [powerPlatformReadme.includes('not a certified Microsoft connector') && powerPlatformReadme.includes('has not been exercised inside a live Power Platform tenant'), 'Power Platform preview/runtime evidence boundary is missing'],
  [powerPlatformReadme.includes('Independent Publisher program is not an eligible shortcut') && powerPlatformReadme.includes('Certified Connector'), 'Power Platform owner-certification gate is missing'],
  [powerPlatformReadme.includes('Bearer ls_live_replace_me') && powerPlatformReadme.includes('Never enter the key as a URL query parameter'), 'Power Platform secret-safe connection instructions are missing'],
  [powerPlatformReadme.includes('Get monthly usage') && powerPlatformReadme.includes('Capture a screenshot') && powerPlatformReadme.includes('Render a page artifact'), 'Power Platform acceptance matrix is incomplete'],
  [powerPlatformReadme.includes('takes no payment') && powerPlatformReadme.includes('owner-managed'), 'Power Platform payment boundary is missing'],
  [readme.includes('implementation-pilot.html#request-pilot'), 'README no-account implementation-pilot path is missing'],
  [readme.includes('https://latchshot.fly.dev/screenshot-api-cost-calculator.html') && readme.includes('Inputs and results are not submitted or stored'), 'README local cost-calculator path or data boundary is missing'],
  [implementationPilotForm.includes('This issue is public.') && implementationPilotForm.includes('Never include an API key'), 'implementation-pilot form public safety warning is missing'],
  [implementationPilotForm.includes('Public GitHub repository URL') && implementationPilotForm.includes('Call-site file path'), 'implementation-pilot form repository scope is missing'],
  [implementationPilotForm.includes('JavaScript') && implementationPilotForm.includes('TypeScript') && implementationPilotForm.includes('Python'), 'implementation-pilot form language boundary is missing'],
  [implementationPilotForm.includes('Provider behavior that must be preserved') && implementationPilotForm.includes('Public acceptance sample'), 'implementation-pilot form acceptance qualification is missing'],
  [implementationPilotForm.includes('does not take payment') && implementationPilotForm.includes('no payment or work starts'), 'implementation-pilot form owner-confirmed start boundary is missing'],
  [readme.includes('https://latchshot.fly.dev/screenshot-safety-review.html'), 'README screenshot safety-review offer is missing'],
  [readme.includes('https://latchshot.fly.dev/screenshot-safety-check.html') && readme.includes('answers and plain-text handoff are not submitted or stored'), 'README local safety-check path or data boundary is missing'],
  [readme.includes('issues/new?template=screenshot-safety-review.yml'), 'README screenshot safety-review form path is missing'],
  [safetyReviewForm.includes('This issue is public.') && safetyReviewForm.includes('Never include an API key'), 'safety-review form public safety warning is missing'],
  [safetyReviewForm.includes('Public GitHub repository URL') && safetyReviewForm.includes('Screenshot route file path'), 'safety-review form repository scope is missing'],
  [safetyReviewForm.includes('JavaScript') && safetyReviewForm.includes('TypeScript') && safetyReviewForm.includes('Python'), 'safety-review language boundary is missing'],
  [safetyReviewForm.includes('risk-ranked report') && safetyReviewForm.includes('regression tests'), 'safety-review deliverables are missing'],
  [safetyReviewForm.includes('does not take payment') && safetyReviewForm.includes('no payment or work starts'), 'safety-review owner-confirmed start boundary is missing'],
  [readme.includes('The hosted renderer source is not published here.'), 'repository scope boundary is missing'],
  [!readme.includes('ls_live_') || readme.includes("ls_live_replace_me"), 'README may contain an API key'],
];

const failed = required.filter(([ok]) => !ok).map(([, message]) => message);
if (failed.length) {
  throw new Error(failed.join('\n'));
}

console.log('Latchshot public contract validation passed.');
