// Pages anyone can open without signing in. Signing out is here too, so it
// works even when the session has already ended.
const PUBLIC_PATHS = [
  "/login",
  "/logout",
  "/auth/google",
  "/auth/callback",
  "/offline",
  "/offline/",
];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname);
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
