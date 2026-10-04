# Bookings app plan

_Written 4 Oct 2026. A plan for `apps/bookings`: a private app where the committee manages clubhouse bookings that arrive through the club's Google Form._

**Status:** `apps/bookings` is scaffolded: Astro in server mode with the Node adapter, one placeholder page, the files that make it installable on phones, and the base mobile-first styles. Nothing is deployed and no Google access is set up yet.

## What it does

- Sign in with a Google account. Only people listed in the app get in.
- List the bookings from the form's response sheet, with a page per booking.
- Add notes and set a status on each booking, stored in the same spreadsheet.
- Four permissions: view bookings, edit booking details, add notes and set status, set payment status.
- Installs from the browser as an app on Android phones and iPhones, and is designed for phones first.

## How it works

```
Browser ──sign in──▶ Google ("who is this?")
   │
   ▼
Bookings app (Node, on cPanel)
   ├── checks the user's permissions in the Users tab
   └── reads and writes the spreadsheet as a service account ──▶ Google Sheets
```

- People prove who they are with Google sign-in, which asks only for their name and email (`openid email profile`). Google doesn't review apps that ask only for these.
- The app reads and writes the sheet as a **service account**, not with each person's own Google access. The sheet is shared with the service account's email as Editor.
- **Why not use each person's own access to the sheet:** sharing is all or nothing (viewer, commenter or editor). Anyone given edit access so the app could write would also be able to open the sheet and change the payment status directly, and the app's permissions would mean nothing. Only the sheet's one or two owners keep direct access.
- The server checks every change against the user's permissions. Hiding a button is a convenience, not the check.

## Stack

| Concern          | Choice                                                                      | Why                                                                                                                                             |
| ---------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework        | Astro 7 with `output: 'server'`                                             | Same as website-v2. A list, a detail page and forms suit server-rendered pages. Astro Actions handle form posts, with Zod validation.           |
| Runtime          | Node 22, `@astrojs/node` in standalone mode                                 | Runs on cPanel's Node.js App. The build bundles its dependencies into `dist/` (about 1 MB), so a deploy uploads `dist/` without `node_modules`. |
| Sign-in          | Google sign-in through [Arctic](https://arcticjs.dev)                       | A small, readable OAuth client. Auth.js is more than one provider needs.                                                                        |
| Sessions         | Astro sessions, stored on the server's disk                                 | Built in. Session data stays on the server.                                                                                                     |
| Sheets           | `@googleapis/sheets` with a service account key                             | Google's official client, with types.                                                                                                           |
| Tests            | Vitest                                                                      | Tests the permission rules and the mapping from sheet rows to bookings without calling Google.                                                  |
| Cross-site posts | Astro's `security.checkOrigin` (on by default in server mode)               | Rejects form posts sent from other sites.                                                                                                       |
| Phone app        | A PWA: web app manifest, icons and a hand-written service worker            | Installs from the browser with no app store. About 40 lines of service worker, so no plugin is needed.                                          |
| Styling          | Plain CSS, mobile first: `src/styles/global.css` plus Astro's scoped styles | A handful of screens doesn't need a CSS framework. Plain CSS is easy to follow.                                                                 |

Each dependency is added in the phase that first uses it.

## Data in the spreadsheet

The form's tab stays as Google Forms writes it. The app adds its own tabs:

| Tab                | Written by                                                | Contents                                                                               |
| ------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `Form Responses 1` | Google Forms, and the app when booking details are edited | One row per booking request                                                            |
| `Status`           | The app                                                   | One row per booking: booking key, status, payment status, who last changed it and when |
| `Notes`            | The app, which only adds rows                             | Booking key, date, author's email, text                                                |
| `Users`            | The sheet's owners, by hand                               | Email, plus one checkbox per permission                                                |

- **Why not add columns to the form's tab:** Google Forms manages that tab's columns, and adding or changing a question changes them.
- **Booking key:** responses have no ID, and row numbers change as soon as someone sorts or deletes rows. Use the submission timestamp, plus the email if the form collects it. We'll confirm this against the real sheet.
- **Notes are only ever added.** Two people writing at the same time can't overwrite each other, and the history shows who wrote what and when.
- **Status and payment status:** whoever saves last wins, because Sheets has no locking. That's fine for a handful of admins. The values come from a fixed list in code. Dropdowns (data validation) on the `Status` tab keep edits made by hand valid.

## Permissions

| Permission           | Allows                                                     |
| -------------------- | ---------------------------------------------------------- |
| View bookings        | The list and detail pages                                  |
| Edit booking details | Changing the form's answers (date, times, contact details) |
| Notes and status     | Adding notes and changing the status                       |
| Payment status       | Changing the payment status                                |

- Every permission includes viewing.
- After signing in, people who aren't in `Users`, or have no boxes ticked, see a page that tells them to ask an admin.
- **Checkboxes instead of roles:** with a handful of users, ticking boxes per person is easier to follow than a table of roles. If the list grows, roles can come later.
- The sheet's owners manage users in the sheet, not in the app.

## Phone app (PWA)

- **Installing:** on Android, Chrome offers "Install app", from its menu or a prompt. iPhones have no prompt: open the app in Safari and tap Share → Add to Home Screen. The app shows iPhone users these steps until they've installed it.
- **What installing adds:** an icon on the home screen, and the app opens full screen without the browser's address bar.
- **No bookings offline, on purpose.** The service worker stores only a "You're offline" page. Bookings hold personal details and change often. Storing them on phones would mean out-of-date statuses, and personal data left on lost or shared phones. Every page comes from the server.
- **Signing in on iPhone:** an installed iPhone app keeps its cookies separate from Safari, so people sign in once more inside the app. Sessions should last long enough (e.g. 30 days) that this is rare.
- **Push notifications** (e.g. "new booking request") are possible later. iPhones support them only in installed apps (iOS 16.4 and later). Not planned yet.
- **Files:** `public/manifest.webmanifest`, `public/icons/`, `public/sw.js` and `src/pages/offline.astro`. The icons are generated from `apps/website/img/Logo.png`.

## Styling: mobile first

- The base styles are for phones. Wider screens add to them with `min-width` media queries, never the other way round.
- Buttons and fields are at least 48px tall (`--tap-size`). Form fields use 16px text, because iOS zooms in on anything smaller.
- On phones, the booking list is a list of cards rather than a table. Wide screens can use a table if it helps.
- Native controls: `<select>` for status and payment status, and `<input type="date">` for dates, so phones show their own pickers.
- Colours come from the club website: orange `#c9491a`, dark `#222429` and light `#f4f5f8`.

## Phases

Each phase is one or more pull requests.

### 0. Scaffold (done)

- `apps/bookings` with Astro in server mode, the Node adapter in standalone mode and a placeholder page.
- `pnpm dev:bookings` (port 4322, so it can run next to website-v2) and `pnpm build:bookings` at the root.
- The manifest, icons, service worker and offline page, and the base mobile-first styles.

### 1. Prove the hosting

Deploy the placeholder page to cPanel before building features, and check that:

- cPanel → Software has **Setup Node.js App** and offers Node 22.12 or later, the minimum for Astro 7.
- Passenger, which runs cPanel's Node apps, starts the app from `dist/server/entry.mjs`, or from a small CommonJS file that imports it.
- `bookings.helderbergpirates.co.za` gets an HTTPS certificate from AutoSSL.
- Uploading a new build and restarting the app works (`tmp/restart.txt`, or the Restart button).
- The app installs from the live address on an Android phone and an iPhone, and the offline page shows in airplane mode. Phones only install apps from HTTPS addresses, so the local dev server can't test this.

If any of these fails, move to Netlify: swap `@astrojs/node` for `@astrojs/netlify`, and the app's code stays the same.

### 2. Google setup and sign-in

- A Google Cloud project owned by the club's Google account, an OAuth consent screen, and an OAuth web client with redirect URLs for localhost and the live subdomain.
- A service account with a JSON key. Share the sheet with its email as Editor.
- Sign-in with Arctic, sessions, middleware that sends signed-out visitors to sign in, and the `Users` lookup.
- Secrets declared in Astro's `astro:env` schema. Locally they go in `.env`, on cPanel in the Node.js App's environment variables.
- **Done when** sign-in works inside the installed app on an iPhone and on an Android phone, not just in a browser.

### 3. Read bookings

- **Needs:** an example of the sheet, with fake data.
- Map each row to a typed `Booking`. Build the list page (cards, upcoming bookings first, with filters) and the detail page.
- Show iPhone users how to install the app.

### 4. Status and notes

- **Needs:** the list of statuses.
- The `Status` and `Notes` tabs, and actions that check permissions.

### 5. Payment status and editing booking details

- **Needs:** the payment statuses, and a decision on "Allow response editing" (see below).

### 6. Deploy workflow

- GitHub Actions: on a `bookings-v*` release, build the app, upload `dist/` over FTPS to the app's folder outside `public_html`, then restart it.
- A separate FTP account rooted at the app's folder, with its own secrets, so the website's deploy can't touch the app and the app's deploy can't touch the website.

## Decisions needed

| Decision                                    | Options                                                                                                  | Needed by |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------- |
| App name and colour on phones               | Today: "Bookings" under the icon, and the website's orange in Android's title bar                        | Phase 1   |
| Who can sign in                             | Only club Google Workspace accounts ("Internal" consent screen), or any Google account listed in `Users` | Phase 2   |
| Which Google account owns the Cloud project | A club account, not a personal one, so access survives committee changes                                 | Phase 2   |
| Booking key                                 | Timestamp, or timestamp plus email                                                                       | Phase 3   |
| Booking statuses                            | e.g. New → Provisional → Confirmed → Completed, plus Declined and Cancelled                              | Phase 4   |
| Payment statuses                            | e.g. Not paid, Deposit paid, Paid in full, Refunded                                                      | Phase 5   |
| "Allow response editing" on the form        | Off, so respondents can't overwrite admin edits, or on, accepting that they can                          | Phase 5   |

## Risks

- **cPanel's Node support isn't confirmed for this hosting plan.** Phase 1 tests it, and Netlify is the fallback.
- **Google sign-in inside an installed iPhone app.** Signing in leaves the app for Google's page, which then has to send the user back with their session intact. Test this on a real iPhone as soon as sign-in exists (phase 2), before building more on it.
- **The logo is small.** The only logo in the repo is 364×364 pixels, so the 512px icons are slightly soft. A larger or vector version of the logo would fix this.
- **Service account keys may be blocked.** Google Cloud organisations created since May 2024 block key creation by default. If the club's Google account is a Workspace organisation, an admin has to allow keys for this project. Projects under a personal Gmail account aren't affected.
- **A leaked key gives full edit access to the sheet.** Keep it only in the server's environment variables, never in the repo. Replace it when someone with server access leaves the committee.
- **Personal information.** Bookings hold names, phone numbers and email addresses, which South Africa's privacy law (POPIA) protects. Only listed users can see them, and the app doesn't log booking contents.
- **Response editing.** If the form lets respondents edit their responses, their edits overwrite changes an admin made to the booking details.
- **The sheet is sorted or edited by hand.** Keying bookings by timestamp instead of row number keeps notes and statuses attached to the right booking.
- **Sheets API quotas.** Every request comes from the one service account, which gets 60 reads a minute. A page needs one or two reads (one `batchGet` covers several tabs), so this only matters with many users at once. Cache reads for a short time if it ever does.
