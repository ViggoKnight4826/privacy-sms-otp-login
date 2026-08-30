import { z } from "zod";
import { infrai } from "./infrai_sms.js";
export const LoginBody = z.object({ phone: z.string().min(7), code: z.string().regex(/^\d{6}$/), purpose: z.literal("developer-tools-login") });
export type LoginBody = z.infer<typeof LoginBody>;
export async function beginLogin(input: unknown) { const body = LoginBody.omit({ code: true }).parse(input); return infrai.sms.otp({ to: body.phone }); }
export async function verifyLogin(input: unknown) { const body = LoginBody.parse(input); const result = await infrai.sms.verify({ to: body.phone, code: body.code }); return result.verified ? { state: "authenticated" as const } : { state: "rejected" as const }; }
