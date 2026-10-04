import type { APIRoute } from "astro";
import { decodeIdToken } from "arctic";
import {
  CODE_VERIFIER_COOKIE,
  googleSignIn,
  loadPermissions,
  NEXT_PATH_COOKIE,
  STATE_COOKIE,
  type GoogleIdTokenClaims,
} from "../../lib/auth";
import { safeNextPath } from "../../lib/paths";
import { canView, type Permissions } from "../../lib/users";

// Google sends people back here after they sign in
export const GET: APIRoute = async ({ url, cookies, session, redirect }) => {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = cookies.get(STATE_COOKIE)?.value;
  const codeVerifier = cookies.get(CODE_VERIFIER_COOKIE)?.value;
  const next = safeNextPath(cookies.get(NEXT_PATH_COOKIE)?.value);
  for (const name of [STATE_COOKIE, CODE_VERIFIER_COOKIE, NEXT_PATH_COOKIE]) {
    cookies.delete(name, { path: "/" });
  }

  // The state has to match the one saved before going to Google, so nobody
  // can finish a sign-in that this browser didn't start. No code means the
  // person cancelled on Google's page.
  if (!code || !state || !codeVerifier || state !== savedState) {
    return redirect("/login?error=sign-in-failed");
  }

  let claims: GoogleIdTokenClaims;
  try {
    const tokens = await googleSignIn(url.origin).validateAuthorizationCode(
      code,
      codeVerifier
    );
    // The ID token comes straight from Google over HTTPS, so it can be read
    // without checking its signature
    claims = decodeIdToken(tokens.idToken()) as GoogleIdTokenClaims;
  } catch (error) {
    console.error("Google sign-in failed", error);
    return redirect("/login?error=sign-in-failed");
  }

  if (!claims.email || claims.email_verified !== true) {
    return redirect("/login?error=sign-in-failed");
  }

  let permissions: Permissions;
  try {
    permissions = await loadPermissions(claims.email);
  } catch (error) {
    console.error("Couldn't read the Users tab", error);
    return redirect("/login?error=users-tab");
  }

  // A new session ID on every sign-in, so an ID planted before signing in
  // can't be used to take over the session
  await session?.regenerate();
  session?.set("user", {
    email: claims.email,
    name: claims.name ?? claims.email,
    permissions,
    permissionsCheckedAt: Date.now(),
  });

  return redirect(canView(permissions) ? next : "/no-access");
};
