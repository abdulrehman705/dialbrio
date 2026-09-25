import { redirect } from "next/navigation";
import { APP_LOGIN_URL } from "@/lib/links";

/** Sign-in lives in the product app; keep /login working for old links. */
export default function LoginPage() {
  redirect(APP_LOGIN_URL ?? "/waitlist");
}
