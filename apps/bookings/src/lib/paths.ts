// Pages anyone can open without signing in. Signing out is here too, so it
// works even when the session has already ended. The privacy policy has to
// be public: Google's sign-in screen links to it.
const PUBLIC_PATHS = [
  "/login",
  "/logout",
  "/privacy",
  "/auth/google",
  "/auth/callback",
  "/offline",
];

export function isPublicPath(pathname: string): boolean {
  // "/privacy/" is the same page as "/privacy". Pages built ahead of time
  // (privacy, offline) are served with the slash.
  const withoutTrailingSlash =
    pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  return PUBLIC_PATHS.includes(withoutTrailingSlash);
}

/**
 * Where to go after signing in. Only paths on this site are allowed, so a
 * crafted link can't send someone to another website after they sign in.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.startsWith("/\\")
  ) {
    return "/";
  }
  return next;
}
