import type { APIRoute } from "astro";
import { generateCodeVerifier, generateState } from "arctic";
import {
  CODE_VERIFIER_COOKIE,
  GOOGLE_SCOPES,
  googleSignIn,
  NEXT_PATH_COOKIE,
  STATE_COOKIE,
} from "../../lib/auth";
import { safeNextPath } from "../../lib/paths";

const TEN_MINUTES_IN_SECONDS = 60 * 10;

// Starts signing in: remembers this attempt in short-lived cookies, then
// sends the person to Google
export const GET: APIRoute = ({ url, cookies, redirect }) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const googleUrl = googleSignIn(url.origin).createAuthorizationURL(
    state,
    codeVerifier,
    GOOGLE_SCOPES
  );
  // Always show Google's account chooser, so people signed in to several
  // Google accounts pick the right one
  googleUrl.searchParams.set("prompt", "select_account");

  const cookieOptions = {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    maxAge: TEN_MINUTES_IN_SECONDS,
    path: "/",
  } as const;
  cookies.set(STATE_COOKIE, state, cookieOptions);
  cookies.set(CODE_VERIFIER_COOKIE, codeVerifier, cookieOptions);
  cookies.set(
    NEXT_PATH_COOKIE,
    safeNextPath(url.searchParams.get("next")),
    cookieOptions
  );

  return redirect(googleUrl.toString());
};
