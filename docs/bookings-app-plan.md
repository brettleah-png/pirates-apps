# Bookings app plan

_Written 4 Oct 2026. A plan for `apps/bookings`: a private app where the committee manages clubhouse bookings that arrive through the club's Google Form._

**Status:** the app runs on Netlify at `bookings.helderbergpirates.co.za`, and the Google Cloud project, service account and test copy of the spreadsheet are set up. Phase 1 is done except the phone tests. Sign-in (phase 2) is built and waiting to be tested with a real Google account.

## What it does

- Sign in with a Google account. Only people listed in the app get in.
- List the bookings from the form's response sheet, with a page per booking.
- Track each booking's status, payment status, invoice number and damage deposit, and add notes, all stored in the same spreadsheet.
- Four permissions: view bookings, edit booking details, add notes and set status, and payments.
- Installs from the browser as an app on Android phones and iPhones, and is designed for phones first.

## How it works

```
Browser ──sign in──▶ Google ("who is this?")
   │
   ▼
Bookings app (on Netlify)
   ├── checks the user's permissions in the Users tab
   └── reads and writes the spreadsheet as a service account ──▶ Google Sheets
```

- People prove who they are with Google sign-in, which asks only for their name and email (`openid email profile`). Google doesn't review apps that ask only for these.
- The app reads and writes the sheet as a **service account**, not with each person's own Google access. The sheet is shared with the service account's email as Editor.
- **Why not use each person's own access to the sheet:** sharing is all or nothing (viewer, commenter or editor). Anyone given edit access so the app could write would also be able to open the sheet and change the payment status directly, and the app's permissions would mean nothing. Only the sheet's owners keep direct access.
- The server checks every change against the user's permissions. Hiding a button is a convenience, not the check.

## Stack

| Concern          | Choice                                                                      | Why                                                                                                                                                                                 |
| ---------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework        | Astro 7 with `output: 'server'`                                             | Same as website-v2. A list, a detail page and forms suit server-rendered pages. Astro Actions handle form posts, with Zod validation.                                               |
| Hosting          | Netlify's free plan, with `@astrojs/netlify`                                | The cPanel plan at Domains.co.za has no Node.js support. Netlify runs the server code, provides HTTPS and deploys from GitHub. The website, domain and email stay at Domains.co.za. |
| Sign-in          | Google sign-in through [Arctic](https://arcticjs.dev)                       | A small, readable OAuth client. Auth.js is more than one provider needs.                                                                                                            |
| Sessions         | Astro sessions, stored in Netlify Blobs                                     | Built in, and the Netlify adapter sets up the storage. Session data stays on the server.                                                                                            |
| Sheets           | `@googleapis/sheets` with a service account key                             | Google's official client, with types.                                                                                                                                               |
| Tests            | Vitest                                                                      | Tests the permission rules and the mapping from sheet rows to bookings without calling Google.                                                                                      |
| Cross-site posts | Astro's `security.checkOrigin` (on by default in server mode)               | Rejects form posts sent from other sites.                                                                                                                                           |
| Phone app        | A PWA: web app manifest, icons and a hand-written service worker            | Installs from the browser with no app store. About 40 lines of service worker, so no plugin is needed.                                                                              |
| Styling          | Plain CSS, mobile first: `src/styles/global.css` plus Astro's scoped styles | A handful of screens doesn't need a CSS framework. Plain CSS is easy to follow.                                                                                                     |

Each dependency is added in the phase that first uses it.

## Data in the spreadsheet

The form's tab stays as Google Forms writes it. The app adds its own tabs:

| Tab                | Written by                                                | Contents                                                                                                                                                                                 |
| ------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Form responses 1` | Google Forms, and the app when booking details are edited | One row per booking request                                                                                                                                                              |
| `Tracking`         | The app                                                   | One row per booking: booking key, booking status, payment status, invoice number, damage deposit (required, status, amount kept back, what the damage was), who last changed it and when |
| `Notes`            | The app, which only adds rows                             | Booking key, date, author's email, text                                                                                                                                                  |
| `Users`            | The sheet's owners, by hand                               | Email, plus one checkbox per permission                                                                                                                                                  |

- **Why not add columns to the form's tab:** Google Forms manages that tab's columns, and adding or changing a question changes them.
- **Booking key: the submission timestamp plus the email address.** The form collects emails and doesn't allow response editing, so a row's timestamp never changes. Row numbers aren't used, because they change as soon as someone sorts or deletes rows.
- **Today's tracking columns move to `Tracking`.** The responses tab has three columns added by hand at the front: State, Damage Deposit Paid/Refunded and Invoice Number. A one-off script copies their values into `Tracking` when the app goes live, and then they're deleted from the responses tab.
- **Columns are found by header, not position.** The form's columns aren't in question order (End Time comes before Start Time), and some headers include the question's help text, so the app matches the start of each header.
- **Dates and times are read as the sheet's raw values**, not as text, so a date like 05/10 can't be misread as 10 May.
- **Notes are only ever added.** Two people writing at the same time can't overwrite each other, and the history shows who wrote what and when.
- **Whoever saves last wins** for statuses and other tracking fields, because Sheets has no locking. That's fine for a handful of admins. Dropdowns (data validation) on the `Tracking` tab keep edits made by hand valid.
- **Development uses a copy.** Building and testing use a copy of the spreadsheet with made-up rows. The live sheet is only connected to the live app.
- **The sheet's ID is a setting, not code.** If the sheet is ever copied, for example when its owner changes, pointing the app at the copy is a settings change.

## Statuses

| Field          | Values                                                                                                                                                                                                                                                           |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Booking status | **New** (received, no action yet), **Client Message** (the client sent a message we have to answer), **Staff Replied** (we've replied or messaged them and are waiting), **Cancelled** (the client or the club cancelled), **Closed** (the function is finished) |
| Payment status | **None** (no payment action yet), **Invoice Sent**, **Deposit Paid** (usually 50% of the fee), **Full Payment Received**, **Refunded** (rare: money paid back after a cancellation)                                                                              |
| Damage deposit | Only on bookings that need one: **Outstanding**, **Paid**, **Refunded**. A refund records the amount kept back and what the damage was.                                                                                                                          |

- **A booking holds its date** once its payment status is Deposit Paid or Full Payment Received, unless it's Cancelled. The app uses this to show which dates are taken.
- **Two kinds of deposit.** "Deposit Paid" is part of the hire fee. The damage deposit is always labelled "Damage deposit", so the two can't be confused.

## Permissions

| Permission           | Allows                                                                        |
| -------------------- | ----------------------------------------------------------------------------- |
| View bookings        | The list and detail pages, without ID numbers                                 |
| Edit booking details | Changing the form's answers (date, times, contact details); seeing ID numbers |
| Notes and status     | Adding notes and changing the booking status                                  |
| Payments             | Changing the payment status, the invoice number and the damage deposit        |

- **The `Users` tab** has a header row, then one row per person: `Email | VIEW_BOOKINGS | EDIT_BOOKING_DETAILS | NOTES_AND_STATUS | PAYMENTS`, with a ticked checkbox or "Yes" in each permission column the person has. Anything else, including "No" or a blank cell, means no. The permission headers are in capitals to show they're fixed names the app looks for, not labels to reword. The app needs those exact headers (upper or lower case), in any order. The app's pages show friendlier names, such as "View bookings".
- Every permission includes viewing.
- **Permissions are re-read every 5 minutes**, so changes in the `Users` tab take effect without signing out. People without access are re-checked on every visit, so they get in as soon as an admin adds them.
- **ID numbers are only shown to people who can edit booking details.** An SA ID number gives away a person's date of birth and gender, so it's the most sensitive field in the sheet under POPIA.
- After signing in, people who aren't in `Users`, or have no boxes ticked, see a page that tells them to ask an admin.
- **Checkboxes instead of roles:** with a handful of users, ticking boxes per person is easier to follow than a table of roles. If the list grows, roles can come later.
- The sheet's owners manage users in the sheet, not in the app.

## Google accounts

- **Users sign in with personal Gmail accounts**, so the OAuth consent screen is "External" and the `Users` tab decides what each person can do.
- **The consent screen stays in "Testing" for now**, because publishing it needs a privacy policy page. In Testing, only accounts listed under Google Auth Platform → Audience → Test users can sign in (up to 100), and anyone else sees "Access blocked". So each person has to be added in two places: the test users and the `Users` tab. A privacy policy page would let the consent screen be published, after which only the `Users` tab matters. The app only asks for name and email, so publishing needs no Google review.
- **The Google Cloud project is owned by `helderbergpirates@gmail.com`, with `treasury@helderbergpirates.co.za` as a second owner.** Both have to be Google accounts. If `treasury@` is only a mailbox at Domains.co.za, create a Google account for that address first (no Gmail needed).
- **The sheet is owned by `lian.pirates@gmail.com` today and may move.** Transferring ownership between Gmail accounts keeps the sharing, so the app keeps working. If the sheet is copied instead, the app needs the copy's ID and the copy has to be shared with the service account.

## Phone app (PWA)

- **Installing:** on Android, Chrome offers "Install app", from its menu or a prompt. iPhones have no prompt: open the app in Safari and tap Share → Add to Home Screen. The app shows iPhone users these steps until they've installed it.
- **What installing adds:** an icon on the home screen, and the app opens full screen without the browser's address bar.
- **No bookings offline, on purpose.** The service worker stores only a "You're offline" page. Bookings hold personal details and change often. Storing them on phones would mean out-of-date statuses, and personal data left on lost or shared phones. Every page comes from the server.
- **Signing in on iPhone:** an installed iPhone app keeps its cookies separate from Safari, so people sign in once more inside the app. Sessions last 30 days, and the session cookie has the same lifetime, so closing the app doesn't sign people out.
- **Push notifications** (e.g. "new booking request") are possible later. iPhones support them only in installed apps (iOS 16.4 and later). Not planned yet.
- **Files:** `public/manifest.webmanifest`, `public/icons/`, `public/sw.js` and `src/pages/offline.astro`. The icons are generated from `apps/website/img/Logo.png`.

## Styling: mobile first

- The base styles are for phones. Wider screens add to them with `min-width` media queries, never the other way round.
- Buttons and fields are at least 48px tall (`--tap-size`). Form fields use 16px text, because iOS zooms in on anything smaller.
- On phones, the booking list is a list of cards rather than a table. Wide screens can use a table if it helps.
- Native controls: `<select>` for statuses, and `<input type="date">` for dates, so phones show their own pickers.
- Colours come from the club website: orange `#c9491a`, dark `#222429` and light `#f4f5f8`.

## Phases

Each phase is one or more pull requests.

### 0. Scaffold (done)

- `apps/bookings` with Astro in server mode, the Netlify adapter and a placeholder page. `netlify.toml` holds the build settings.
- `pnpm dev:bookings` (port 4322, so it can run next to website-v2) and `pnpm build:bookings` at the root.
- The manifest, icons, service worker and offline page, and the base mobile-first styles.

### 1. Prove the hosting (done, except the phone tests)

- A Netlify account under `helderbergpirates@gmail.com`, deploying this repo with the package directory `apps/bookings`.
- `bookings.helderbergpirates.co.za` points at Netlify with a CNAME record in the **Domains.co.za client area's DNS settings**. That's the domain's live DNS. cPanel's Zone Editor only holds an unused copy with the email record, so records added there do nothing.
- Still to do: check that the app installs on an Android phone and an iPhone, and that the offline page shows in airplane mode.

Netlify deploys `master` to the live site and builds a preview for each pull request. Previews can't sign in, because Google only accepts sign-in from listed addresses, but they're fine for checking pages.

### 2. Google setup and sign-in

- Set up: a Google Cloud project owned by `helderbergpirates@gmail.com` with `treasury@helderbergpirates.co.za` as a second owner, an "External" consent screen in Testing with test users, an OAuth web client returning to `/auth/callback` on localhost and the live subdomain, and a service account shared as Editor on the test copy of the spreadsheet.
- Built: sign-in with Arctic (`/auth/google`, `/auth/callback`), 30-day sessions, sign-out as a form post (`/logout`), middleware that sends signed-out visitors to `/login` and remembers where they were going, the `Users` lookup, and a "No access yet" page.
- The five settings are declared in Astro's `astro:env` schema and listed in `apps/bookings/.env.example`. Locally they go in `apps/bookings/.env`, which git ignores. On Netlify they go in the project's environment variables. They're never committed or pasted into chat.
- `pnpm test:bookings` covers reading the `Users` tab and the sign-in redirects. `pnpm check:bookings` type-checks the TypeScript. (`astro check` is broken with this setup's dependencies and is being deprecated, so the check runs `tsc` directly.)
- **Done when** sign-in works inside the installed app on an iPhone and on an Android phone, not just in a browser.

### 3. Read bookings

- Map each row to a typed `Booking`, finding columns by header. Build the list page (cards, upcoming bookings first, with filters) and the detail page.
- The responses tab is called `Form responses 1` (lowercase r), in both the real sheet and the test copy.
- Show which dates are taken.
- Show ID numbers only to people who can edit booking details.
- Show iPhone users how to install the app.

### 4. Tracking and notes

- The `Tracking` and `Notes` tabs, and actions that check permissions: booking status, notes, payment status, invoice number and damage deposit.

### 5. Editing booking details

- Changing the form's answers from the app, for people with the "Edit booking details" permission.

### 6. Go live

- Share the live spreadsheet with the service account and point the live app at it.
- Run the one-off script that copies State, Damage Deposit Paid/Refunded and Invoice Number into `Tracking`, check the result, then delete those three columns from the responses tab.
- Fill in the `Users` tab.

## Decided

| Decision                          | Answer                                                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Hosting                           | Netlify. The cPanel plan has no Node.js support.                                                                          |
| Who can sign in                   | Personal Gmail accounts that are test users in Google Cloud and listed in `Users` ("External" consent screen, in Testing) |
| Google Cloud project owner        | `helderbergpirates@gmail.com`, with `treasury@helderbergpirates.co.za` as second owner                                    |
| Booking key                       | Timestamp plus email                                                                                                      |
| "Allow response editing"          | Off                                                                                                                       |
| Statuses                          | See [Statuses](#statuses)                                                                                                 |
| When a booking holds its date     | Deposit Paid or Full Payment Received, unless Cancelled                                                                   |
| ID numbers                        | The form keeps asking. Only people who can edit booking details see them.                                                 |
| Invoice number and damage deposit | Part of the payments permission                                                                                           |
| Refunds after a cancellation      | Usually not, but the payment status has a Refunded option for when it happens                                             |
| App name and colour on phones     | "Bookings" under the icon, and the website's orange in Android's title bar                                                |

## Still open

| Question            | Options                                                                                                                                                                                                    | Needed by                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Privacy policy page | A public `/privacy` page in the app, or a page on the club website. It lets the consent screen be published, and a privacy notice for the booking form's personal data is worth having under POPIA anyway. | Before inviting many users |

## Risks

- **Google sign-in inside an installed iPhone app.** Signing in leaves the app for Google's page, which then has to send the user back with their session intact. Test this on a real iPhone as soon as sign-in exists (phase 2), before building more on it.
- **A leaked key gives full edit access to the sheet.** Keep it only in Netlify's environment variables and a local `.env`, never in the repo. Replace it when someone with access to it leaves the committee.
- **Personal information.** Bookings hold names, phone numbers, email addresses and ID numbers, which South Africa's privacy law (POPIA) protects. Only listed users can see bookings, only editors see ID numbers, development uses made-up data, and the app doesn't log booking contents.
- **The sheet changes owner by copying.** The copy has a new ID and isn't shared with the service account. Update the app's setting and share the copy.
- **The sheet is sorted or edited by hand.** Keying bookings by timestamp and email instead of row number keeps notes and tracking attached to the right booking.
- **Netlify's free plan has a monthly usage allowance.** If the app used it all, Netlify would pause the site until the next month. A committee app should use a small fraction of it; check the usage after the first month.
- **Sheets API quotas.** Every request comes from the one service account, which gets 60 reads a minute. A page needs one or two reads (one `batchGet` covers several tabs), so this only matters with many users at once. Cache reads for a short time if it ever does.
- **The logo is small.** The only logo in the repo is 364×364 pixels, so the 512px icons are slightly soft. A larger or vector version of the logo would fix this.
