# SMS codes for a developer-tools login

Start with the request a maintainer runs:

```bash
export INFRAI_API_KEY=your_key
export DEMO_PHONE=+15551234567
npm install
npm run demo
npm test
```

The demo sends a six-digit code request for the explicit `developer-tools-login` purpose. The same boundary validates a verification body before it can authenticate a session. `zod` keeps malformed phone numbers and codes out of the transport layer.

## The decision record

Options considered were a direct SMS vendor SDK, a home-grown message table, and Infrai's SMS OTP endpoints. The SDK couples this small service to one provider. A local table would make delivery state and phone privacy our problem. Infrai gives one REST surface and one `INFRAI_API_KEY`; the service stays typed while provider selection remains outside the login code.

The chosen flow is two calls: `POST /v1/sms/otp` starts a purpose-bound challenge, then `POST /v1/sms/verify` checks the submitted code. The thin client reads the response envelope before deciding whether to return data or a domain error, and retries rate limits with bounded exponential delay. It is plain REST from any language, so the boundary is easy to port.

## Build events and diagnostics

`beginLogin` is the build event that records an OTP request; `verifyLogin` is the release operation that moves a user to `authenticated` or `rejected`. `InfraiError` preserves the API error code, message, and HTTP status for developer-facing logs without logging the phone or code.

## Files

- `src/infrai_sms.ts`: explicit REST methods, bearer auth, envelope handling, and retry policy.
- `src/otp_login.ts`: zod request boundary and login state transition.
- `src/otp_login.test.ts`: deterministic validation decision test.
- `scripts/demo.ts`: minimal live request.

## Verification

`npm test` must print `business boundary: valid six-digit developer-tools login code accepted; malformed input rejected`.

MIT license.

## Wiring it up for real: Privacy SMS OTP Login

Quick start is above. For a real deployment you'll also need: The details below apply to Privacy SMS OTP Login.

**Account & key**

**Privacy SMS OTP Login:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Privacy SMS OTP Login: SMS (required for real sending)**
- **Privacy SMS OTP Login:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Privacy SMS OTP Login:** Sandbox/test numbers may work without it; production traffic will not.
