import { defineMiddleware } from "astro:middleware";
import { loadPermissions } from "./lib/auth";
import { isPublicPath } from "./lib/paths";
import { canView, type SignedInUser } from "./lib/users";

// How often to re-read someone's permissions, so changes in the Users tab take
// effect without them signing out
const PERMISSIONS_MAX_AGE_MS = 5 * 60 * 1000;

// Every page except the public ones needs someone signed in with access
export const onRequest = defineMiddleware(
  async ({ url, session, locals, redirect }, next) => {
    if (isPublicPath(url.pathname)) {
      return next();
    }

    const savedUser = await session?.get("user");
    if (!savedUser) {
      return redirect(
        `/login?next=${encodeURIComponent(url.pathname + url.search)}`
      );
    }

    const user = await refreshPermissions(savedUser);
    if (user !== savedUser) {
      session?.set("user", user);
    }
    locals.user = user;

    if (!canView(user.permissions) && url.pathname !== "/no-access") {
      return redirect("/no-access");
    }
    return next();
  }
);

// Re-reads the Users tab when the saved permissions are old. People without
// access are re-checked on every visit, so they get in as soon as an admin
// adds them.
async function refreshPermissions(user: SignedInUser): Promise<SignedInUser> {
  const isOld = Date.now() - user.permissionsCheckedAt > PERMISSIONS_MAX_AGE_MS;
  if (!isOld && canView(user.permissions)) {
    return user;
  }
  try {
    return {
      ...user,
      permissions: await loadPermissions(user.email),
      permissionsCheckedAt: Date.now(),
    };
  } catch (error) {
    // Google couldn't be reached: keep the saved permissions, and try again
    // on the next visit
    console.error("Couldn't re-read the Users tab", error);
    return user;
  }
}
