import { beginLogin } from "../src/otp_login.js";
const phone = process.env.DEMO_PHONE;
if (!phone) throw new Error("DEMO_PHONE is required");
const result = await beginLogin({ phone, purpose: "developer-tools-login" });
console.log("otp request accepted", result);
