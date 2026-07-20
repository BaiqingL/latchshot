# Latchshot

[![Contract validation](https://github.com/BaiqingL/latchshot/actions/workflows/validate.yml/badge.svg)](https://github.com/BaiqingL/latchshot/actions/workflows/validate.yml)

Turn a public webpage into a PNG, JPEG, or PDF through a guarded, bounded Chromium API.

- Production: <https://latchshot.fly.dev>
- API documentation: <https://latchshot.fly.dev/docs.md>
- OpenAPI 3.1: [`openapi.json`](openapi.json)
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

The response body is the artifact. Render timing, navigation state, and remaining quota are returned in headers.

## Contract

Latchshot supports public HTTP and HTTPS pages on ports 80 and 443. It bounds viewport size, JPEG quality (1–100), delay, deadline, concurrency, queue depth, and output size. Optional best-effort controls can block known third-party ad/tracker/chat hosts and hide common cookie-consent or newsletter/signup/discount overlays without clicking, submitting, or accepting consent. Private, loopback, link-local, special-use, and mixed public/private DNS targets are rejected.

It intentionally does not support:

- cookies, login sessions, or private-network pages;
- arbitrary browser scripts or multi-step interaction;
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

Only successful direct renders consume quota. Failed renders do not, and automatic overages are disabled. Existing key holders can request a paid tier through the [production upgrade form](https://latchshot.fly.dev/#upgrade); payment and activation are handled separately by the owner.

## Provider migration

Already using a screenshot API? Start with the [general option map and production cutover checklist](https://latchshot.fly.dev/migrate.md), then use the provider-specific request and stop-list reference:

- [ApiFlash to Latchshot](https://latchshot.fly.dev/guides/migrate-from-apiflash.html): query/form key, binary response, option units, cache, extraction, and storage boundaries.
- [ScreenshotMachine to Latchshot](https://latchshot.fly.dev/guides/migrate-from-screenshotmachine.html): signed image URL, dimensions, error response, cache, device, and page-state boundaries.
- [ScreenshotOne to Latchshot](https://latchshot.fly.dev/guides/migrate-from-screenshotone.html): query credential, seconds-to-milliseconds conversion, hosted output, async, and page-modification boundaries.
- [Urlbox to Latchshot](https://latchshot.fly.dev/guides/migrate-from-urlbox.html): signed render links, temporary hosted URLs, response shape, cache, async, and storage boundaries.

Move only trusted-server synchronous public-page jobs that fit Latchshot's smaller contract. Keep the current provider for every job that depends on a guide's stop list.

Not sure whether the compatible slice covers your job? Open a [public migration-fit question](https://github.com/BaiqingL/latchshot/issues/new?template=migration-fit.yml) with the request contract and required provider behavior. Do not include keys, private or signed URLs, customer data, or sensitive artifacts.

If the contract fits but you do not want to wire it yourself, Latchshot offers a [$99 one-time implementation pilot](https://latchshot.fly.dev/migrate.md) for one existing JavaScript/TypeScript or Python backend call site in a public GitHub repository you control. The pilot includes a focused patch, tests, an approved public acceptance sample, and a rollback note. API usage is separate, and the owner confirms scope and handles payment before work starts.

## Integrations

- [CLI and Node client](https://github.com/BaiqingL/latchshot-cli)
- [GitHub Action](https://github.com/BaiqingL/latchshot-action)
- [Hosted MCP contract](https://github.com/BaiqingL/latchshot-mcp)
- [Claude Code plugin](https://github.com/BaiqingL/latchshot-claude-code)
- [Gemini CLI extension](https://github.com/BaiqingL/latchshot-gemini-cli)
- [Dify plugin](https://github.com/BaiqingL/latchshot-dify)
- [n8n workflow](https://github.com/BaiqingL/latchshot-n8n)
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
