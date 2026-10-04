declare namespace App {
  interface SessionData {
    user: import("./lib/users").SignedInUser;
  }

  interface Locals {
    /** Set by the middleware on every page that needs signing in */
    user: import("./lib/users").SignedInUser;
  }
}

/** Light, dark, or follow the device */
type ThemeChoice = "system" | "light" | "dark";

// Defined by the inline script in Layout.astro
interface Window {
  setTheme(choice: ThemeChoice): void;
  savedTheme(): ThemeChoice;
}
