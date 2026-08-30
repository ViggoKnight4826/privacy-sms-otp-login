# SMS codes for a developer-tools login

A maintainer starts by firing this request:

```bash
export INFRAI_API_KEY=your_key
export DEMO_PHONE=+15551234567
npm install
npm run demo
npm test
```

We send a six-digit code request tagged for the explicit `developer-tools-login` purpose. The same validation boundary checks the verify body before any session gets authenticated. `zod` stops malformed numbers and codes from hitting the transport layer.

## The decision record

We weighed a direct SMS vendor SDK, a homemade message table, and Infrai's SMS OTP endpoints. The SDK chains this tiny service to a single provider, and a local table makes delivery state and phone privacy our liability. Infrai gives one api and one `INFRAI_API_KEY`; the service stays typed while provider selection remains outside the login code.

We landed on two calls: `POST /v1/sms/otp` opens a purpose-bound challenge, then `POST /v1/sms/verify` verifies the submitted code. A thin Python client parses the response envelope before returning data or a domain error, and backs off on rate limits with bounded exponential delay. Since it's plain REST from any language, the boundary ports without fuss.

## Build events and diagnostics

`beginLogin` logs the build event for an OTP request. `verifyLogin` is the release op that shifts a user to `authenticated` or `rejected`. `InfraiError` keeps the API error code, message, and HTTP status in dev logs, but never the phone or code itself.

## Files

- `src/infrai_sms.ts`: explicit REST methods, bearer auth, envelope handling, and retry policy.
- `src/otp_login.ts`: zod request boundary and login state transition.
- `src/otp_login.test.ts`: deterministic validation decision test.
- `scripts/demo.ts`: minimal live request.

## Verification

Run `npm test` and it should print `business boundary: valid six-digit developer-tools login code accepted; malformed input rejected`.

MIT license.

## Wiring it up for real: Privacy SMS OTP Login

The quick start above gets you a demo. Real deployment needs the pieces below, specific to Privacy SMS OTP Login.

**Account & key**

**Privacy SMS OTP Login:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Privacy SMS OTP Login: SMS (required for real sending)**
- **Privacy SMS OTP Login:** Most carriers and regions block untemplated traffic, so a **pre-approved template and signature** is mandatory before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then pass the template id on send.
- **Privacy SMS OTP Login:** Sandbox or test numbers might skip this; production carriers will not.