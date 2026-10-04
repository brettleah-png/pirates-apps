import type { APIRoute } from "astro";

// Signing out is a form post, so another site can't sign people out with a
// link. Astro rejects posts from other sites.
export const POST: APIRoute = ({ session, redirect }) => {
  session?.destroy();
  return redirect("/login");
};
