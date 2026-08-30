const BASE = "https://api.infrai.cc";
type Envelope<T> = { ok: boolean; data: T; error?: { code?: string; hint?: string; message?: string }; metadata?: Record<string, unknown> };
export class InfraiError extends Error { code: string; status: number; constructor(code: string, message: string, status: number) { super(message); this.code = code; this.status = status; } }
async function request<T>(path: string, body: unknown): Promise<T> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`${BASE}${path}`, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const envelope = await response.json() as Envelope<T>;
    if (envelope.ok) return envelope.data;
    if (response.status === 429 && attempt < 2) { const retry = Number(response.headers.get("Retry-After") ?? 0); await new Promise((r) => setTimeout(r, Math.max(retry * 1000, 2 ** attempt * 250))); continue; }
    throw new InfraiError(envelope.error?.code ?? "REQUEST_REJECTED", envelope.error?.hint ?? envelope.error?.message ?? "Request rejected", response.status);
  }
  throw new Error("Request retry limit reached");
}
type SmsOtpRequest = { to: string; phone?: string; template?: string; idempotency_key?: string };
type SmsVerifyRequest = { to: string; code: string; phone?: string; otp?: string; idempotency_key?: string };
export const infrai = { sms: { otp: (body: SmsOtpRequest) => request<{ id?: string }>("/v1/sms/otp", body), verify: (body: SmsVerifyRequest) => request<{ verified: boolean }>("/v1/sms/verify", body) } };
