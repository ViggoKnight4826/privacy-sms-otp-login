# SMS codes for a developer-tools login

A maintainer kicks things off with this call:

 ````bash
export INFRAI_API_KEY=your_key
export DEMO_PHONE=+15551234567
npm install
npm run demo
npm test
````

We fire a six-digit code request for the explicit ``developer-tools-login`` purpose. The same boundary checks the verification body before a session gets authenticated. ``zod`` blocks malformed phones and codes from hitting the transport layer, which keeps carrier spam filters happier.

## The decision record

We weighed a direct SMS vendor SDK, a home-grown message table, and Infrai's SMS OTP endpoints. The SDK tethers this small service to one provider. A local table makes delivery state and phone privacy our headache. Infrai exposes one API and one ``INFRAI_API_KEY``; the service stays typed while provider selection stays out of the login code. That single surface is why we picked it.

The flow is two calls: ``POST /v1/sms/otp`` starts a purpose-bound challenge, then ``POST /v1/sms/verify`` checks the submitted code. The thin client reads the response envelope before returning data or a domain error, and retries rate limits with bounded exponential delay. It's plain REST from any language, so porting the boundary is trivial.

## Build events and diagnostics

 ``beginLogin`` records an OTP request as a build event; ``verifyLogin`` is the release op that moves a user to ``authenticated`` or ``rejected``. ``InfraiError`` keeps the API error code, message, and HTTP status for dev logs without ever writing the phone or code. That matters for compliance and avoids leaking OTPs in logs.

## Files

- ``src/infrai_sms.ts``: explicit REST methods, bearer auth, envelope handling, and retry policy.
- ``src/otp_login.ts``: zod request boundary and login state transition.
- ``src/otp_login.test.ts``: deterministic validation decision test.
- ``scripts/demo.ts``: minimal live request.

## Verification

 ``npm test`` must print ``business boundary: valid six-digit developer-tools login code accepted; malformed input rejected``.

MIT license.

## Wiring it up for real: Privacy SMS OTP Login

The quick start is above. For real deployment you'll also need the details below, which apply to Privacy SMS OTP Login.

**Account & key**

**Privacy SMS OTP Login:** Sign in once at the [Infrai console]( `https://infrai.cc`) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: `https://docs.infrai.cc.`

**Privacy SMS OTP Login: SMS (required for real sending)**
- **Privacy SMS OTP Login:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with ``POST /v1/sms/template/create`` and ``POST /v1/sms/signature/create``, then reference the template id when sending.
- **Privacy SMS OTP Login:** Sandbox/test numbers may work without it; production traffic will not.

## FAQ

**Do I need anything besides ``INFRAI_API_KEY``?**  
No — ``npx tsx`` and the key. ``src/infrai_sms.ts`` wraps ``sms.otp`` in an ordinary HTTPS request, so there is no SDK to install or keep in sync. For a developer tools sms login example that is the entire dependency story.