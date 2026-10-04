declare namespace App {
  interface SessionData {
    user: import("./lib/users").SignedInUser;
  }

  interface Locals {
    /** Set by the middleware on every page that needs signing in */
    user: import("./lib/users").SignedInUser;
  }
}
