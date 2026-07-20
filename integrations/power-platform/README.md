# Latchshot custom connector for Microsoft Power Platform

This preview package describes three Latchshot actions for Microsoft Power Automate, Power Apps, and Azure Logic Apps:

- **Capture a screenshot** — return a supported public page as a PNG or JPEG file object.
- **Render a page artifact** — return a PNG, JPEG, or PDF file object with bounded readiness and cleanup controls.
- **Get monthly usage** — read plan, quota, counters, reset time, and informational continuation links without consuming render quota.

## Distribution status

This is a self-service custom-connector package, not a certified Microsoft connector, Independent Publisher connector, Marketplace listing, or claim of Microsoft endorsement. It has not been exercised inside a live Power Platform tenant. The files are contract-validated against the production Latchshot API and are published as a transparent preview for owner-run tenant testing.

Latchshot owns the underlying API, so Microsoft's Independent Publisher program is not an eligible shortcut. An official out-of-box listing requires the owner to use the Certified Connector process, accept Microsoft's CLA and program terms, submit through ISV Studio, and provide tenant screenshots proving the operations inside successful flows.

## Files

- [`apiDefinition.swagger.json`](apiDefinition.swagger.json) — fixed-origin OpenAPI 2.0 action contract.
- [`apiProperties.json`](apiProperties.json) — secure connection field and connector metadata for CLI-based import.

## Prerequisites

1. A Power Platform environment where you are authorized to create custom connectors.
2. One [card-free Latchshot API key with 100 successful renders each UTC month](https://latchshot.fly.dev/#trial).
3. A secret store or connection record controlled by the environment owner.

Do not paste a key into a flow definition, action input, screenshot URL, source repository, issue, or run log.

## Import through the Power Platform UI

1. Open **Custom connectors** in your Power Automate or Power Apps environment.
2. Choose **New custom connector** → **Import an OpenAPI file**.
3. Select `apiDefinition.swagger.json` and name the connector `Latchshot`.
4. Review the fixed host `latchshot.fly.dev`, HTTPS scheme, definitions, and three actions before creating it.
5. Create a connection. In the **Authorization** field, enter the word `Bearer`, one space, and the key:

   ```text
   Bearer ls_live_replace_me
   ```

Power Platform stores that value as a secure connection parameter and sends it only in the `Authorization` header. Never enter the key as a URL query parameter.

For CLI-based import, keep `apiDefinition.swagger.json` and `apiProperties.json` together and follow Microsoft's current custom-connector CLI documentation. Do not treat a successful schema import as a production flow test.

## Owner-run acceptance checks

Run these checks in a non-production environment with a key owned by the tester:

1. **Get monthly usage** returns a plan plus non-negative `limit` and `remaining` values without changing `successful`.
2. **Capture a screenshot** for `https://example.com` returns a non-empty PNG file whose signature begins with `89 50 4E 47`.
3. **Render a page artifact** with `kind: pdf`, `paper: A4`, and `url: https://example.com` returns a non-empty PDF beginning with `%PDF-`.
4. A private target such as `http://127.0.0.1` is rejected and creates no successful-render usage.
5. A connection with an invalid key receives HTTP 401 and exposes no secret in the flow definition or run output.

Only the tenant owner can provide the missing Power Platform runtime evidence. Save screenshots of the test operation and three successful flows if the connector will later enter Microsoft's Certified Connector process.

## Artifact handling

The two render actions return direct bytes. Power Platform represents a binary response as a file object with `$content-type` and base64 `$content`. Pass the whole file object to a downstream file/content input when the target connector supports it. Do not put `$content` into ordinary text, chat, or logging actions unless the artifact is intentionally public.

Latchshot does not host a permanent customer artifact URL. If a flow needs a durable URL, store the returned file in SharePoint, OneDrive, Azure Blob Storage, or another owner-controlled destination, then use that destination's URL and retention policy.

## Service boundary

Latchshot accepts only supported public HTTP/HTTPS pages on ports 80/443. It rejects private, loopback, link-local, credential-bearing, special-use, and mixed public/private DNS targets. It intentionally does not support:

- cookies, authenticated sessions, or private-network pages;
- arbitrary scripts, clicks, typing, or multi-step browser actions;
- CAPTCHA solving, proxy rotation, or anti-bot bypass;
- permanent provider-hosted artifact URLs;
- automatic overage billing.

Cleanup controls are best-effort. They block bounded lists of known third-party hosts or hide common overlays without accepting consent, submitting forms, or setting customer state. Keep a browser you control when the workflow depends on unsupported behavior.

## Quota and payment boundary

Only successful renders consume quota. The recurring Free plan includes 100 successful renders per UTC month, failed renders do not consume that allowance, and automatic overages are disabled. `GetUsage` exposes informational paid-plan and implementation-pilot links; reading them takes no payment, changes no plan, and starts no work. Plan activation remains owner-managed after separate payment verification.

## Support

For a reproducible public-page contract problem, open a [Latchshot issue](https://github.com/BaiqingL/latchshot/issues/new?template=contract-problem.yml). Never include an API key, private or signed URL, customer page, unredacted run history, or base64 artifact.
