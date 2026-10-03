# Photo Gallery Management Plan

_Written 2026-10-03, based on the repo at commit `1fbf4e0`. File paths below are relative to `apps/website/`._

## Summary

- The site's photo gallery is managed through `upload.php`, a PHP admin page with **no authentication**. Anyone who finds the URL can upload files, delete albums, or (from reading the code) wipe the whole website with a single GET request.
- Uploaded files are never type-checked, so an attacker can upload and run their own PHP code on the server.
- The admin also has bugs: captions are saved but never shown, and captions can end up on the wrong photo.
- **Do the [immediate actions](#1-immediate-actions-do-these-first-whichever-option-is-chosen) first, whichever option is chosen.**
- Then choose one of three options: remove the gallery, harden the PHP uploader, or move photos to a hosted service. The recommendation is a hosted service, ideally an Instagram feed widget, since no new backend is needed.

---

## How the gallery works today

| File                        | Role                                                                                                                                            |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `upload.php`                | Admin "Upload Manager": create, rename and delete albums; upload images; edit captions. Not linked from the public nav, but publicly reachable. |
| `gallery.php`               | Public gallery: lists album folders, shows each album's images in a lightbox.                                                                   |
| `uploads/<album>/`          | One folder per album, holding image files named `<unix-timestamp>_<original-filename>`.                                                         |
| `uploads/<album>/data.json` | Captions: `[{ "filename": "...", "description": "..." }]`.                                                                                      |

What the PHP handlers in `upload.php` do:

| Trigger                                | Effect                                                | Lines              |
| -------------------------------------- | ----------------------------------------------------- | ------------------ |
| POST `rename_album` + `new_album_name` | Renames the album folder                              | `upload.php:8-20`  |
| GET `?delete_album=X`                  | Recursively deletes `uploads/X`                       | `upload.php:23-40` |
| GET `?album=X&delete=F`                | Deletes one image and its `data.json` entry           | `upload.php:43-56` |
| POST `update_desc`                     | Saves the edited captions to `data.json`              | `upload.php:59-71` |
| POST `images[]`                        | Saves the uploaded files and adds them to `data.json` | `upload.php:74-94` |

**Legacy copies that are still publicly reachable** (nothing links to them, but they still run if someone requests them):

- `new/upload.php`: an identical copy of `upload.php`, with the same vulnerabilities.
- `upload_handler.php`, `delete_image.php`, `update_description.php` and their copies in `new/`: the older flat gallery's upload, delete and caption endpoints, also unauthenticated.
- `gal.php`, `new/gallery.php`, root `data.json` and the loose `uploads/*.jpg` files: the older gallery versions.

---

## Vulnerabilities

| Severity     | Issue                                           | Where                                                                                              | What an attacker can do                                                                                                                                                                                                                                                            |
| ------------ | ----------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Critical** | Recursive delete escapes the uploads folder     | `upload.php:24-35`                                                                                 | `upload.php?delete_album=..` resolves to `uploads/..`, which is the web root. PHP's `basename('..')` returns `'..'`, so nothing blocks it. The code then deletes every file and folder the PHP process has write access to. **One unauthenticated GET request can wipe the site.** |
| **Critical** | Any file type is accepted                       | `upload.php:83-88`, `upload_handler.php`, `new/upload.php`                                         | Upload `shell.php`, then request `uploads/<album>/<timestamp>_shell.php` to run arbitrary code on the server. `accept="image/*"` only filters the browser's file picker. The server never checks the type.                                                                         |
| **High**     | No authentication on any gallery endpoint       | `upload.php`, `new/upload.php`, `upload_handler.php`, `delete_image.php`, `update_description.php` | Delete or rename any album or image, rewrite captions, or host arbitrary content (images, HTML phishing pages) on the club's domain.                                                                                                                                               |
| **Medium**   | Stored XSS through filenames                    | `gallery.php:153`, `gallery.php:167`                                                               | Image paths are echoed without `htmlspecialchars`. A file uploaded as `x" onerror="alert(1).jpg` runs script for every visitor to the public gallery.                                                                                                                              |
| **Medium**   | Destructive actions use GET links               | `upload.php:23`, `upload.php:43`                                                                   | A link, an `<img src>` on another site, a crawler, or browser prefetching can trigger deletes. There is no CSRF protection.                                                                                                                                                        |
| Low          | No upload size or count limit                   | `upload.php:74-94`                                                                                 | Fill the server's disk.                                                                                                                                                                                                                                                            |
| Low          | `?album=` isn't sanitized when reading captions | `upload.php:98-101`                                                                                | Read any `data.json` elsewhere on disk through path traversal. Minor, since the data isn't sensitive.                                                                                                                                                                              |
| Low          | Folders created with `0777` permissions         | `upload.php:5`, `upload.php:77`                                                                    | Any user on a shared host can write to them.                                                                                                                                                                                                                                       |

### Functional bugs in the current gallery

- **Captions are never shown.** `gallery.php` lists images straight from the folder (`gallery.php:161`) and never reads `data.json`. The lightbox `<p>` (`gallery.php:177`) stays empty.
- **Captions can land on the wrong photo.** Caption boxes are created inside `FileReader.onload` callbacks (`upload.php:273-283`), which finish in whatever order the files load, not the order they were selected. The server pairs `descriptions[$i]` with `images[$i]` by position.
- **Missing fallback image.** `uploads/default.jpg` is referenced (`gallery.php:149`, `gallery.php:153`) but doesn't exist.

### Related issues outside the gallery (same root cause: no auth)

These are out of scope for this plan, but are recorded here so they aren't lost:

| File              | Issue                                                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `save-feeds.php`  | Anyone can overwrite `feeds.json`, which controls the calendar feeds on the homepage and schedule page.                       |
| `ics-to-json.php` | Open proxy (SSRF): it fetches any URL server-side. It also has `display_errors` turned on.                                    |
| `contact.php`     | Email header injection: `$name` goes into the `From:` header without CR/LF stripping, so the form can be abused to send spam. |
| `signup.php`      | Syntax error on line 3; the file can't run. Unused.                                                                           |

---

## 1. Immediate actions (do these first, whichever option is chosen)

The repo is **not** necessarily what's deployed, since files arrive as drops from Richard. These steps must be done **on the live server**.

1. **Take a full backup** of the live site (files plus any `uploads/` content).
2. **Remove or block** these on the server:
   - `upload.php`
   - the entire `new/` folder
   - `upload_handler.php`, `delete_image.php`, `update_description.php`

   If the gallery admin must stay available while a decision is made, protect it with HTTP Basic Auth instead of removing it (cPanel calls this "Directory Privacy"; otherwise use `.htaccess` + `.htpasswd`).

   The release deploy workflow (see the root `README.md`) **won't remove these files**. It only deletes files that an earlier deploy uploaded.

3. **Check `uploads/` and `new/uploads/` on the server for anything that isn't an image**: `.php`, `.phtml`, `.phar`, `.html`, `.htaccess`, or files with odd names. If you find any, treat the site as compromised: tell the hosting provider, change the hosting, FTP and database passwords, and restore from a known-good copy.
4. **Agree a workflow with Richard** so future file drops don't re-add these files. This repo should be the source of truth, with deploys going out through releases.

---

## 2. Options

### Option 1: Remove the gallery, link to social media

The club already has [Facebook](https://www.facebook.com/profile.php?id=61581433657465) and [Instagram](https://www.instagram.com/helderbergpirates/).

**Steps**

1. Delete `upload.php`, `gallery.php`, `gal.php`, the `new/` folder, the root `data.json`, `upload_handler.php`, `delete_image.php`, `update_description.php` and `uploads/`.
2. Point the "Gallery" nav item in every page header at the Instagram profile (`target="_blank"`).

**Effort:** minutes. **Ongoing maintenance:** none. **Attack surface:** none.
**Trade-off:** photos leave the site, and visitors go to Instagram or Facebook to see them.

### Option 2: Harden the existing PHP uploader

Only worth doing if someone at the club will actually upload to the website rather than social media.

**Checklist**

- [ ] **Authentication:** move the admin into its own folder (e.g. `admin/`) and protect it with HTTP Basic Auth, or add a PHP session login using `password_hash()` / `password_verify()`.
- [ ] **Validate uploads on the server:** allow only `jpg`, `jpeg`, `png` and `webp`; confirm each file really is an image with `getimagesize()` or `finfo_file()`; **ignore the client's filename** and generate one (e.g. `bin2hex(random_bytes(8)) . '.jpg'`); enforce a maximum size.
- [ ] **Block script execution in `uploads/`:** add an `uploads/.htaccess` (Apache/LiteSpeed only), for example:
  ```apache
  <FilesMatch "\.(php|phtml|phar|html?)$">
      Require all denied
  </FilesMatch>
  ```
- [ ] **Constrain album paths:** apply the same `preg_replace` sanitizing to every album parameter (delete, rename, read), reject empty, `.` and `..` names, and check with `realpath()` that the result stays inside `uploads/`.
- [ ] **Turn deletes into POST forms** with a CSRF token.
- [ ] **Escape output** in `gallery.php:153` and `gallery.php:167` with `htmlspecialchars()`.
- [ ] **Show captions:** make `gallery.php` read each album's `data.json`.
- [ ] **Fix caption ordering:** create the preview elements synchronously inside the file loop and only set the `<img src>` in `onload`.
- [ ] Optional: resize and compress images on upload (GD), since phone photos are several MB each.
- [ ] Delete the legacy files listed above.

**Effort:** a day or two. **Ongoing maintenance:** you own the security of upload code from now on.
**Unknowns:** the hosting type (Apache, LiteSpeed or Nginx) decides whether `.htaccess` works. The PHP version is at least 7.4, because the code uses arrow functions (`fn`).

### Option 3: A hosted service (no backend needed)

The hosted service stores the photos and handles logins. The site only embeds a snippet or reads public data in the browser. All upload PHP can be deleted.

> **Google Photos is not viable.** In March 2025 Google removed the API permissions that let apps read a user's library and shared albums. Embedding a shared album now depends on unofficial third-party tools that scrape the share page and can break at any time.

#### 3a. Instagram feed widget (recommended if photos already go to Instagram)

Instagram shut down its simple Basic Display API in December 2024. A third-party widget service now connects to the account and keeps the access token refreshed (the club can't do that without a backend).

**Providers to compare:** Behold (behold.so), LightWidget (lightwidget.com), SnapWidget (snapwidget.com), Elfsight (elfsight.com).

**Steps**

1. Switch the club's Instagram to a **Professional account** (Creator or Business). It's free and done in Instagram's settings. Most widgets require it now.
2. Sign up with a widget provider and connect the Instagram account.
3. Configure a grid layout and copy the embed snippet (a `<script>` plus a container element).
4. Paste it into the gallery page, replacing the PHP album code. The page can then become plain HTML.

**Uploading:** post to Instagram as usual. No new workflow.
**Caveats**

- Free plans differ in post count, view limits, branding and refresh frequency. Compare them when deciding.
- No albums: it shows the feed. Check whether the chosen provider supports filtering by hashtag.
- You depend on the provider. If it shuts down or changes its free plan, the gallery breaks. Fallback: link to the Instagram profile (Option 1).

#### 3b. Facebook Page Plugin

An official Facebook embed of a Page's timeline.

**Steps**

1. Confirm the club's Facebook presence is a **Page**, not a personal profile. The `profile.php?id=61581433657465` URL format is used by both, so the URL alone doesn't tell you. The plugin only works for Pages.
2. Generate the snippet with the official configurator: https://developers.facebook.com/docs/plugins/page-plugin
3. Paste the result. It's an iframe, roughly like this:
   ```html
   <iframe
     src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D61581433657465&tabs=timeline&width=500&height=700&adapt_container_width=true"
     width="500"
     height="700"
     style="border:none;overflow:hidden"
     scrolling="no"
     frameborder="0"
     allowfullscreen="true"
   >
   </iframe>
   ```

**Uploading:** post to Facebook as usual.
**Caveats:** maximum width is 500px; it shows a timeline, not a photo grid; ad blockers and privacy extensions often hide it; the Page must be public with no age or country restrictions.

#### 3c. Flickr album embed

**Steps**

1. Create a Flickr account for the club and invite whoever uploads (or share the login).
2. Create one Flickr album per gallery album.
3. On each album page, use **Share → Embed** and paste the snippet into the gallery page. It's an `<a data-flickr-embed="true">` element plus a script from `embedr.flickr.com`.

**Uploading:** Flickr web or mobile app; captions are photo titles and descriptions.
**Caveats:** free accounts are capped at **1,000 photos**; the embed is a slideshow, not a grid; adding an album means pasting another snippet; it looks dated.

#### 3d. Public Google Drive folder

**Steps**

1. Create a Drive folder (with one subfolder per album) and share it as "Anyone with the link: Viewer".
2. Embed it:
   ```html
   <iframe
     src="https://drive.google.com/embeddedfolderview?id=FOLDER_ID#grid"
     style="width:100%; height:600px; border:0;"
   >
   </iframe>
   ```

**Uploading:** drag photos into the folder; give committee members edit access.
**Caveats:** `embeddedfolderview` is **undocumented** and could stop working; it looks plain; clicking a photo opens Drive in a new tab; no captions.

#### 3e. Cloudinary (most control, styled like the site)

Cloudinary hosts the images, and the site draws its own grid from a public JSON list. Cloudinary also resizes and compresses automatically, which fixes the multi-MB image problem.

**Steps**

1. Create a free Cloudinary account and invite whoever uploads.
2. Under **Settings → Security → Restricted media types**, untick **Resource list**. This allows the public `…/image/list/<tag>.json` endpoint.
3. Use one **tag** per album (e.g. `album-open-day-2026`). Add captions as contextual metadata with the key `caption`.
4. Add a gallery script along these lines. It's an untested sketch, so check the field names against a real response:
   ```html
   <div id="gallery" class="row g-3"></div>
   <script>
     const CLOUD_NAME = "your-cloud-name";
     const ALBUM_TAG = "album-open-day-2026";

     async function loadGallery() {
       const listUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${ALBUM_TAG}.json`;
       const response = await fetch(listUrl);
       const data = await response.json();
       const gallery = document.getElementById("gallery");

       for (const image of data.resources) {
         const thumbnailUrl =
           `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/` +
           `c_fill,w_400,h_300,f_auto,q_auto/v${image.version}/${image.public_id}.${image.format}`;
         const caption = image.context?.custom?.caption ?? "";

         const figure = document.createElement("figure");
         const img = document.createElement("img");
         img.src = thumbnailUrl;
         img.alt = caption;
         img.loading = "lazy";

         const figcaption = document.createElement("figcaption");
         figcaption.textContent = caption; // textContent, not innerHTML, to avoid XSS

         figure.append(img, figcaption);
         gallery.append(figure);
       }
     }

     loadGallery();
   </script>
   ```

**Uploading:** Cloudinary's web Media Library, tagging each photo with its album.
**Caveats**

- The site can't list tags without an API secret, so the list of albums has to be written into the page. Adding a new album means a small code change.
- The list endpoint is CDN-cached, so new uploads can take a short while to appear.
- The free plan is credit-based. Check that the expected traffic fits.
- You write and maintain the grid and lightbox code (about 50 lines).

---

## Photo consent for junior players

This applies to every option. The club fields U/10, U/12 and U/15 teams. Under POPIA, photos of identifiable children are personal information, and publishing them needs consent from a parent or guardian. Before any gallery goes live (including an Instagram feed embedded on the site), confirm that the club collects photo consent at registration, for example in the "Become a Pirate" Google Form, and that whoever posts knows which players must not be shown.

---

## Recommendation

1. **Now:** complete the [immediate actions](#1-immediate-actions-do-these-first-whichever-option-is-chosen).
2. **Then:** if the club already posts photos to Instagram, go with **3a (Instagram feed widget)**. Nobody has to change how they post, and no upload code is left on the server.
3. Choose **3e (Cloudinary)** only if the club wants albums kept separate from social media and a gallery styled to match the site.
4. Choose **Option 2** only if someone is committed to uploading to the website itself. The test captions in `uploads/` (`"1 updated"`, `"This is konami she is a sog"`) suggest the admin has only been tried out so far.

## Open questions for the club / Richard

- [ ] Where do club photos end up today, and who puts them there?
- [ ] Does anyone use `upload.php`?
- [ ] Is the Facebook presence a Page or a personal profile?
- [ ] Is the Instagram account a Professional account?
- [ ] Who hosts the site, what kind of server is it (Apache, LiteSpeed or Nginx; cPanel?), and who has access?
- [ ] Is the live server or this repo the source of truth? How do changes get deployed?
- [ ] Does the club collect photo consent from parents of junior players?

## Not yet verified

- That the live server matches this repo.
- The `delete_album=..` wipe was found by reading the code; it hasn't been run (PHP isn't installed locally). How much it deletes depends on the server's file permissions.
- Remote code execution through uploads assumes the server runs `.php` files inside `uploads/`. Most shared hosts do by default.
- Third-party pricing, free-plan limits and API policies change. Re-check them when choosing.
