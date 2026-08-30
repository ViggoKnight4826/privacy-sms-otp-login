import { LoginBody, verifyLogin } from "./otp_login.js";
const valid = LoginBody.safeParse({ phone: "+15551234567", code: "123456", purpose: "developer-tools-login" });
if (!valid.success) throw new Error("valid login body was rejected");
const invalid = LoginBody.safeParse({ phone: "123", code: "12", purpose: "developer-tools-login" });
if (invalid.success) throw new Error("invalid phone/code was accepted");
const missingCode = LoginBody.safeParse({ phone: "+15551234567", purpose: "developer-tools-login" });
if (missingCode.success) throw new Error("missing verification code was accepted");
console.log("business boundary: valid six-digit developer-tools login code accepted; malformed input rejected");
