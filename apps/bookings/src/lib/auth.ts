// Signing in with Google, and loading what each person may do
import { Google } from "arctic";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "astro:env/server";
import { readTab } from "./sheets";
import { permissionsFromUsersTab, type Permissions } from "./users";

/** Only the name and email: Google doesn't review apps that ask for no more */
export const GOOGLE_SCOPES = ["openid", "email", "profile"];

// Cookies that carry the sign-in attempt to Google and back
export const STATE_COOKIE = "google_oauth_state";
export const CODE_VERIFIER_COOKIE = "google_code_verifier";
export const NEXT_PATH_COOKIE = "sign_in_next";

/**
 * Google sends people back to /auth/callback on the address they signed in
 * from. Both addresses (localhost and the live domain) are registered in the
 * Google Cloud project.
 */
export function googleSignIn(origin: string): Google {
  return new Google(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    `${origin}/auth/callback`
  );
}

/** The parts of Google's ID token the app uses */
export interface GoogleIdTokenClaims {
  email?: string;
  email_verified?: boolean;
  name?: string;
}

export async function loadPermissions(email: string): Promise<Permissions> {
  return permissionsFromUsersTab(await readTab("Users"), email);
}
