// @ts-check
import netlify from "@astrojs/netlify";
import { defineConfig, envField } from "astro/config";

// How long people stay signed in
const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

// Settings come from apps/bookings/.env locally and Netlify's environment
// variables in production. All are secret: read on the server at runtime,
// never built into the pages.
const secret = () => envField.string({ context: "server", access: "secret" });

// https://astro.build/config
export default defineConfig({
  // Every page is rendered on request: bookings are private and change often
  output: "server",
  adapter: netlify(),
  // website-v2 uses 4321, so both apps can run at the same time
  server: { port: 4322 },
  env: {
    schema: {
      GOOGLE_CLIENT_ID: secret(),
      GOOGLE_CLIENT_SECRET: secret(),
      GOOGLE_SERVICE_ACCOUNT_EMAIL: secret(),
      GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: secret(),
      SPREADSHEET_ID: secret(),
    },
  },
  // The Netlify adapter stores sessions in Netlify Blobs
  session: {
    ttl: THIRTY_DAYS_IN_SECONDS,
    // Without a max age the cookie ends when the browser closes, and phones
    // close installed apps often
    cookie: { maxAge: THIRTY_DAYS_IN_SECONDS },
  },
});
