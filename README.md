# Helderberg Pirates

Code for the Helderberg Pirates Baseball Club.

## Layout

| Path                 | Contents                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `apps/website/`      | The club website. Plain HTML and PHP with no build step, hosted on cPanel at Domains.co.za. |
| `apps/website-v2/`   | The website's Astro rebuild, in progress (see `docs/website-v2-plan.md`). Not deployed yet. |
| `docs/`              | Club history documents and planning notes. Not deployed.                                    |
| `.github/workflows/` | GitHub Actions workflows.                                                                   |

## Development

The repo is a [pnpm](https://pnpm.io) workspace: each folder in `apps/` that has a `package.json` is a package.

Requirements: Node 22 (`nvm use` reads `.nvmrc`) and pnpm 10 (`corepack enable` installs the version in `package.json`).

```sh
pnpm install

pnpm dev            # website-v2 dev server at http://localhost:4321
pnpm build          # website-v2 static build into apps/website-v2/dist/
pnpm preview        # serve that build locally

pnpm format         # format the repo with Prettier
pnpm format:check   # check formatting without changing files
```

`dev`, `build` and `preview` at the root forward to `apps/website-v2`. To run any other workspace script from the root, use `pnpm --filter <package> <script>`; inside an app's folder, `pnpm <script>` runs that app's own scripts.

The old site (`apps/website`) has no build step. `pnpm dev:website` serves it at http://localhost:8000 with PHP's built-in server, so PHP must be installed (`brew install php` on macOS). The contact form can't send email locally.

## Deploying the website

`.github/workflows/deploy-website.yml` uploads `apps/website/` to `public_html/` over FTPS.

**To deploy:** on GitHub, go to Releases → Draft a new release, create a tag named `website-vX.Y.Z` (e.g. `website-v1.0.0`) and publish it. Pre-releases and tags without the `website-v` prefix don't deploy.

**Dry run:** Actions → Deploy website → Run workflow. The log lists what would be uploaded and deleted, without changing the server.

**Roll back:** in Actions, open the deploy run of the previous release and choose "Re-run all jobs".

### What a deploy does

- Uploads only the files that changed since the last deploy. The action tracks this in `.ftp-deploy-sync-state.json` on the server.
- Deletes a file from the server when it's removed from the repo, **but only if an earlier deploy uploaded it**. Files that were put on the server some other way are never deleted.
- Never touches `uploads/` or `data.json`. The gallery photos and captions exist only on the server.
- Calendar feeds are set in `apps/website/feeds.json`. Change them in the repo and release; there is no editor on the site.

**Don't edit files on the server directly.** The next release overwrites them. Make changes in this repo.

### One-time setup

1. In cPanel → FTP Accounts, create an account for deploys. Set its **Directory** to `public_html`. cPanel pre-fills `public_html/<username>`, which is wrong.
2. In cPanel → FTP Accounts → Configure FTP Client, note the FTP server hostname.
3. In GitHub → Settings → Secrets and variables → Actions, add:

   | Secret                | Value                                                    |
   | --------------------- | -------------------------------------------------------- |
   | `CPANEL_FTP_SERVER`   | FTP server hostname                                      |
   | `CPANEL_FTP_USERNAME` | Full FTP username, e.g. `deploy@helderbergpirates.co.za` |
   | `CPANEL_FTP_PASSWORD` | FTP password                                             |

4. Run a dry run and check the log. The workflow verifies the server's TLS certificate. If the dry run fails with a certificate error, set `CPANEL_FTP_SERVER` to the server's own hostname instead of `ftp.<domain>`.

### Before the first release

The first deploy has no state file yet, so it uploads **every** file and overwrites the server's copies.

1. Back up `public_html` (cPanel → Backup, or compress it in File Manager).
2. Compare the server's files with `apps/website/`. Commit any newer changes from the server first.
