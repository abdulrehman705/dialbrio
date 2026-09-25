/**
 * The product app lives in its own repo and deployment. Set NEXT_PUBLIC_APP_LOGIN_URL to its sign-in page
 * (e.g. https://app.dialbrio.com/login) to show "Log in" on the site; leave it unset to hide it.
 */
export const APP_LOGIN_URL = process.env.NEXT_PUBLIC_APP_LOGIN_URL?.trim() || null;
