// @ts-check
import netlify from "@astrojs/netlify";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  // Every page is rendered on request: bookings are private and change often
  output: "server",
  adapter: netlify(),
  // website-v2 uses 4321, so both apps can run at the same time
  server: { port: 4322 },
});
