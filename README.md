# Latchshot

[![Contract validation](https://github.com/BaiqingL/latchshot/actions/workflows/validate.yml/badge.svg)](https://github.com/BaiqingL/latchshot/actions/workflows/validate.yml)

Turn a public webpage into a PNG, JPEG, or PDF through a guarded, bounded Chromium API.

- Production: <https://latchshot.fly.dev>
- API documentation: <https://latchshot.fly.dev/docs.md>
- OpenAPI 3.1: [`openapi.json`](openapi.json)
- Immutable contract snapshot: [`contract-v0.1.5`](https://github.com/BaiqingL/latchshot/releases/tag/contract-v0.1.5)
- Service health: <https://latchshot.fly.dev/healthz>

This is the canonical public contract, examples, and support repository for the hosted Latchshot service. The hosted renderer source is not published here.

## Start free

Create one [card-free API key with 100 successful renders each UTC calendar month](https://latchshot.fly.dev/?intent=githubcore#trial). The key is shown once, so save it in a secret manager.

```sh
export LATCHSHOT_API_KEY='ls_live_replace_me'

curl --fail-with-body https://latchshot.fly.dev/v1/render \
  -H "Authorization: Bearer $LATCHSHOT_API_KEY" \
  -H 'Content-Type: application/json' \
  --data '{
    "url": "https://example.com",
    "format": "jpeg",
    "quality": 85,
    "width": 1440,
    "height": 900
  }' \
  --output capture.jpg
```

The response body is the artifact. Render timing, navigation state, remaining quota, and read-only usage/paid-plan/implementation-pilot URLs are returned in headers. Those URLs take no payment, change no plan, and start no implementation work.

## Contract

Latchshot supports public HTTP and HTTPS pages on ports 80 and 443. It bounds viewport size, JPEG quality (1–100), delay, deadline, concurrency, queue depth, and output size. For full-page screenshots, optional `scrollPage` makes one deterministic sweep capped at 48 steps, 5 seconds, and 20,000 pixels to activate lazy content without caller-supplied actions. Optional best-effort controls can block known third-party ad/tracker/chat hosts and hide common cookie-consent or newsletter/signup/discount overlays without clicking, submitting, or accepting consent. Private, loopback, link-local, special-use, and mixed public/private DNS targets are rejected.

It intentionally does not support:

- cookies, login sessions, or private-network pages;
- arbitrary browser scripts, custom scrolling, or multi-step interaction;
- CAPTCHA solving, proxy rotation, or anti-bot bypass;
- automatic overage billing.

Use a browser you control when the job needs authentication, private connectivity, or browser actions.

## Plans

| Plan | Successful renders per UTC month | Monthly price |
| --- | ---: | ---: |
| Free | 100 | $0 |
| Launch | 2,500 | $19 |
| Build | 12,000 | $49 |
| Scale | 50,000 | $149 |

Only successful direct renders consume quota. Failed renders do not, and automatic overages are disabled. Authenticated usage responses include stable plans, upgrade-form, upgrade-documentation, and bounded [$99 implementation-pilot](https://latchshot.fly.dev/implementation-pilot.html) links so REST and MCP clients can expose the optional next step. Existing key holders can request a paid tier through the [production upgrade form](https://latchshot.fly.dev/#upgrade); payment, activation, and implementation start are handled separately by the owner.

## Provider migration

Already using a screenshot API? Start with the [general option map and production cutover checklist](https://latchshot.fly.dev/migrate.md), then use the provider-specific request and stop-list reference:

- [ApiFlash to Latchshot](https://latchshot.fly.dev/guides/migrate-from-apiflash.html): query/form key, binary response, option units, cache, extraction, and storage boundaries.
- [ScreenshotMachine to Latchshot](https://latchshot.fly.dev/guides/migrate-from-screenshotmachine.html): signed image URL, dimensions, error response, cache, device, and page-state boundaries.
- [ScreenshotOne to Latchshot](https://latchshot.fly.dev/guides/migrate-from-screenshotone.html): query credential, seconds-to-milliseconds conversion, hosted output, async, and page-modification boundaries.
- [Urlbox to Latchshot](https://latchshot.fly.dev/guides/migrate-from-urlbox.html): signed render links, temporary hosted URLs, response shape, cache, async, and storage boundaries.
- [Browserless to Latchshot](https://latchshot.fly.dev/guides/migrate-from-browserless.html): public-URL screenshot overlap, direct image bytes, wait controls, and the browser-session, page-state, inline-HTML, action, and network-placement stop list.

Move only trusted-server synchronous public-page jobs that fit Latchshot's smaller contract. Keep the current provider for every job that depends on a guide's stop list.

Not sure whether the compatible slice covers your job? Open a [public migration-fit question](https://github.com/BaiqingL/latchshot/issues/new?template=migration-fit.yml) with the request contract and required provider behavior. Do not include keys, private or signed URLs, customer data, or sensitive artifacts.

If the contract fits but you do not want to wire it yourself, Latchshot offers a [$99 one-time implementation pilot](https://latchshot.fly.dev/implementation-pilot.html) for one existing JavaScript/TypeScript or Python backend call site in a public GitHub repository you control. The pilot includes a focused patch, tests, an approved public acceptance sample, and a rollback note. Existing key holders reuse the same key. API usage is separate, and the owner confirms scope and handles payment before work starts.

After reviewing the exact boundary, use the [no-account implementation-pilot request](https://latchshot.fly.dev/implementation-pilot.html#request-pilot) with the repository, call-site path, non-secret request contract, required behavior, volume, and public acceptance sample. A [public GitHub pilot form](https://github.com/BaiqingL/latchshot/issues/new?template=implementation-pilot.yml) remains available for a public review thread. Neither path takes payment or authorizes work.

Before opening a fit question, use the [browser-local screenshot API cost and migration fit calculator](https://latchshot.fly.dev/screenshot-api-cost-calculator.html). It selects the smallest published plan from your successful monthly volume and supported-workload share, then estimates recurring change using the avoidable provider cost you supply. Inputs and results are not submitted or stored, and the estimate is not a quote or savings guarantee.

Already operate a screenshot endpoint? Start with the free [browser-local seven-gate safety check](https://latchshot.fly.dev/screenshot-safety-check.html); its answers and plain-text handoff are not submitted or stored. The fixed-scope [$149 screenshot endpoint safety review](https://latchshot.fly.dev/screenshot-safety-review.html) covers one public-repository JavaScript, TypeScript, or Python route with a risk-ranked report, focused patch, regression tests, and residual-risk handoff. Use the [no-account intake](https://latchshot.fly.dev/screenshot-safety-review.html#request-review) or the [public GitHub fit form](https://github.com/BaiqingL/latchshot/issues/new?template=screenshot-safety-review.yml). Neither path takes payment, grants repository access, or starts work.

## Integrations

- [CLI and Node client](https://github.com/BaiqingL/latchshot-cli)
- [GitHub Action](https://github.com/BaiqingL/latchshot-action)
- [Hosted MCP contract](https://github.com/BaiqingL/latchshot-mcp)
- [Accepted Open Connector source provider and setup](https://latchshot.fly.dev/integrations.md#open-connector)
- [Claude Code plugin](https://github.com/BaiqingL/latchshot-claude-code)
- [Gemini CLI extension](https://github.com/BaiqingL/latchshot-gemini-cli)
- [Dify plugin](https://github.com/BaiqingL/latchshot-dify)
- [n8n workflow](https://github.com/BaiqingL/latchshot-n8n)
- [Microsoft Power Platform custom connector preview](integrations/power-platform/README.md) — immutable [`v0.1.0-preview.1` package](https://github.com/BaiqingL/latchshot/releases/tag/power-platform-v0.1.0-preview.1)
- [Supabase Edge Function screenshot guide](https://latchshot.fly.dev/guides/supabase-edge-function-screenshot.html)
- [Vercel and Next.js screenshot API guide](https://latchshot.fly.dev/guides/vercel-nextjs-screenshot-api.html)
- [Screenshot API product backend guide](https://latchshot.fly.dev/guides/screenshot-api-backend.html)
- [Full-page screenshots with lazy-loaded content](https://latchshot.fly.dev/guides/full-page-screenshot-lazy-loading.html)
- [SSRF-safe website screenshot guide](https://latchshot.fly.dev/guides/ssrf-safe-screenshot-api.html)
- [VS Code, Cursor, goose, and other recipes](https://latchshot.fly.dev/integrations.md)

## Examples

The dependency-free examples read `LATCHSHOT_API_KEY` from the environment and never accept a key as a command-line argument.

```sh
node examples/capture.mjs https://example.com capture.png
python3 examples/capture.py https://example.com capture.png
```

For all options, response headers, errors, and current evidence boundaries, use the [developer documentation](https://latchshot.fly.dev/docs.md).

## Support and security

Open an issue for a reproducible public-page contract problem. Do not include an API key, private URL, signed URL, customer data, or unredacted response headers. Security reports follow [SECURITY.md](SECURITY.md).

## Repository license

The contract snapshot, examples, and documentation in this repository are MIT licensed. The hosted Latchshot service is separate proprietary software.
