# Production Edge Fixture

This is a disposable local test stack, not a deployment command. It composes the
actual backend base, production and staging files with `docker-compose.edge-test.yml`.
It mounts the checked-out production `ops/Caddyfile` bytes, production rate limiter,
production Next Dockerfile, .NET Production services, SQL migrations/reference data
and RabbitMQ. The staging layer contributes only internal Mailpit SMTP.
No deployment, backup, restore, admin bootstrap or development seeder is invoked.

## Commands

Run from `C:/Users/Legion/Desktop/TranXit/TranXit-Frontend` with Node dependencies
installed, Chromium installed for Playwright, and local Docker Desktop running.
Compose 2.24.4+ is required for `!override`.

```powershell
npm run e2e:edge:unit
npm run e2e:edge:check
npm run e2e:edge:test -- --list
npm run e2e:edge:credibility

# Only after the coordinating task approves local builds/runtime:
npm run e2e:edge:up
npm run e2e:edge:ready
npm run e2e:edge:test -- --project=edge-desktop
npm run e2e:edge:test
npm run e2e:edge:logs
npm run e2e:edge:down
```

`check`, `unit` and test discovery do not build images or start containers.
`up` builds the actual images, starts with admission closed, checks both public
origins return exact 503/maintenance-body/`Retry-After: 60` responses, checks the
private same-Caddy BFF listener, records the mounted Caddy SHA, then opens the
fixture-local gate. Private smoke alone is available through
`node e2e/scripts/edge-stack.mjs smoke-private`, including while the gate is closed.

The default HTTPS port is 18443, with a free loopback port selected if occupied.
To select one explicitly, set `$env:TRANXIT_EDGE_HTTPS_PORT = '19443'` before `up`.
The chosen origin is printed. Existing gateway ports 18088/18188 and frontend
ports 3000/3100 are never reused. No SQL, RabbitMQ, gateway, SMTP, Mailpit API,
plain HTTP, or private 8082 port is published. OTP retrieval uses the internal
backend network through a guarded fixture command; production Caddy exposes no Mailpit site.

## Isolation And Secrets

Each run has a random `tranxit-edge-test-*` project, image tags, networks and named
volumes. Remote Docker TCP/SSH endpoints are rejected. The wrapper supplies a
fresh empty env file and an allowlisted process environment; application URLs,
production credentials, Docker overrides and TLS-disabling options are not inherited.
All credentials are cryptographically generated. The staging Compose layer still
requires a Mailpit bcrypt value, so the fixture derives it through the real Caddy CLI
with the password supplied through stdin, never command arguments.

State lives under `e2e/.auth/edge-runtime/`, already ignored by Git **and Docker**.
POSIX directories/files are restricted to 0700/0600; Windows uses a protected ACL
for the current user and SYSTEM before writing secrets. No browser storage-state
file is saved. Runtime credentials and public CA are not copied into build layers.

Startup/test failure leaves the fixture gated closed, with redacted logs retained for diagnosis.
`down` verifies the project scope, removes only that project's containers/networks/
volumes, verifies removal, deletes credential state, and retains redacted logs.
It does not prune shared images or Docker build caches. Start a fresh fixture after
a failed test run; there is deliberately no automatic recovery/redeployment path.

## Local HTTPS

Reserved `.localhost` names trigger [Caddy's local CA](https://caddyserver.com/docs/automatic-https#local-https).
No public ACME account, DNS change, production target or host trust-store change is
needed. Only the public CA certificate is exported. Node readiness/Mailpit requests
verify it explicitly and resolve the fixture names to loopback. Playwright's
`ignoreHTTPSErrors` exception is confined to the fixture-created browser contexts;
neither the Next app nor .NET nor global Node TLS verification is disabled.

The production Caddyfile is not rewritten for the green suite. The exact CI-only
deltas are: `DOMAIN` and `STAGING_DOMAIN` are reserved `.localhost` names (therefore
local CA instead of public ACME), host port 443 is bound to one random loopback port,
and `/run/tranxit/admission` is a fixture-owned directory. Mailpit remains internal
and is not added to production Caddy. `edge-artifacts.tsv` records canonical source,
selected source, and in-container SHA-256 for every browser case.

## Coverage

- `T-E2E-EDGE.CookieOnlyGoldenFlow`: real UI register, Mailpit OTP, verification,
  login, non-default lookup/job/bid inputs, acceptance and persisted reloads;
  wrong-role and wrong-owner calls are denied. Non-default fractional prices must
  agree in the live preview, request, customer view, history and accepted reload.
- `T-E2E-EDGE.ZeroQuoteRoundTrip`: invalid input blocks submission, maximum-value
  preview fits its panel, and a zero quote remains a submitted and acceptable bid.
- `T-E2E-EDGE.UnauthenticatedDenied`: protected BFF requests and page guards.
- `T-E2E-EDGE.RawAuthAliasesContained`: valid login bodies/ambient cookies across
  raw, namespace, case, slash and encoded aliases on both public sites; no raw tokens.
- `T-E2E-EDGE.BffRefreshLogout`: identity-only BFF responses, Secure/HttpOnly cookies,
  rotation and memory-only post-logout cookie replay rejected by the backend.
- `T-E2E-EDGE.AdmissionGatePreservesWrites`: real Caddy 503 responses, spoofed-header
  denial, private smoke while closed, refused creates add no jobs, and an acknowledged
  job survives close/reopen.
- Post-suite rate contract: exactly 100 configured auth events are admitted within
  10 seconds, request 101 returns 429, and a request is admitted after the window.

The six browser tests run serially on Chromium desktop, tablet and mobile (18 cases).
No fetch/page.route mocks, direct gateway tokens, dev OTP cookies or demo accounts
are used. Mailpit API access is only for OTP retrieval. Browser trace/video/screenshot
and failure DOM retention are off to avoid recording credentials; sanitized wrapper
and service logs are retained instead. The normal Playwright config excludes this suite;
the dedicated edge config refuses to start without `TRANXIT_EDGE_E2E=1`, and the source
contains no self-skip. A full run must record all 18 mounted-file rows or it fails.

`e2e:edge:credibility` copies production Caddy into the private ignored fixture directory,
changes only the two public-site imports, requires startup to fail because closed admission
returns 200, records the exact diff, and removes only that fixture. The normal green run
then mounts the pristine checkout bytes.

These tests do not close the full Batch 3 recovery-journal/fault-injection matrix or
prove a staging restore drill. They use the approved all-in quote arithmetic contract,
but do not choose currency/payment policies or claim immediate revocation of already-issued access
JWTs. Build/runtime results must be recorded by the coordinating task after running
the commands above; discovery and static checks are not browser execution evidence.
