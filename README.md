# Yuliya × Chih-hsing
## Private shared memory archive · Version 11

A love letter and a shared home for Yuliya and Chih-hsing's photographs, recordings, poems, wishes, and future letters.

[Open the website](https://yuliya-love-chihhsing.bounniecrisis.chatgpt.site/)

## Release identity

- **Production Site:** Version 11.
- **Exact deployed source:** annotated tag `v11` → `17d9602c74d1b1c140c08d1b9b95694407cc6a8e`.
- **Current source branch:** `production` may include later documentation and governance commits that have not been deployed as a new Site version.

A README or governance commit does not create a new application version. The package metadata version is also separate from the Sites release number.

## What is included

| Space | Current features |
| --- | --- |
| Love Letter · 情書 | Six sequential quiz chapters, photograph pairings, classical poetry selections, and letter display settings. Members can edit each question, answer, and correct/wrong/empty-answer feedback. |
| Memory Titles | Private main titles and optional Chinese subtitles for the six letter chapters, with reset-to-default controls. |
| Memories · 音像輯 | **Add memories** uploads photographs, audio, and video. Organize and search media, add dates and notes, mark favourites, and play recordings or videos in the detail view. Photographs can be paired with letter questions and carry separate perspectives from both people. |
| Keepsakes · 記憶庫 | Generate an annual PDF of photographs, poetry, perspectives, and completed wishes; export the complete archive as a ZIP. |
| Wishes · 願望單 | Organize wishes with categories, dates, budgets, links, and notes; maintain individual collections, see shared wishes, and turn completed wishes into memories. |
| Our poetry · 萬葉鈔 | A leaf-marked Poetry Collection with all unique excerpts from the selectable built-in poetry sets, private saved poems, search, and separate comments from both people. |
| Our nicknames · 暱稱賬 | Record nicknames, their origins, first-use dates, and funny moments. |
| Our next year · 規劃錄 | Create and edit a twelve-month reunion plan using wishes, available time, and savings/budget estimates. |
| Future Letters · 未來書 | Save drafts with photographs and audio, choose an opening time, and seal letters for the future. |
| Our places · 緣の島 | Add locations and coordinates to memories, explore map pins, and browse dated story chapters. |

### Quiz updates and letter snapshots

Saving or resetting a quiz override resets both members' sequential progress to that question, preserving earlier completions. That question and later chapters must be unlocked again. Revision checks reject stale edits and prevent an answer to an older question revision from restoring progress after a concurrent update. Reload or return to the page to receive another member's changes.

In Letter settings, a member can copy a saved poem into any of the six pages or enter a custom poem directly. Each page stores an independent private snapshot: changing or deleting the collection entry does not change the saved letter poem. Reset restores the built-in selection. Built-in excerpts can also be saved as private editable copies with comments.

### Media and backups

**Version 12 candidate (not yet live-verified):** this source adds Memory Library
targets of photo 15 MiB, audio 60 MiB, and video 100 MiB. Audio/video use bounded
streaming and incremental SHA-256, not whole-file buffering. These are application
limits, not a demonstrated Sites upload ceiling. The last verified deployed
release above remains Version 11 until candidate deployment and live checks.
See [Version 12 media report](VERSION_12_MEDIA_UPLOAD_CHANGELOG.md) for evidence
and release status. The following 12/24 MiB limits describe Version 11.

- 音像輯 supports photo uploads, MP4/WebM video, and MP3/M4A/WAV/OGG/WebM audio. Audio/video uploads are limited to 24 MiB; browser playback depends on codec support.
- Standard archive images are limited to 12 MiB. HEIC/HEIF input is limited to 24 MiB and converted locally; archive uploads retain the original alongside the display image.
- Only photographs can be paired with quiz chapters. A general video upload does not select the letter's surprise video; that has a dedicated upload control.
- Voice recordings can accompany photographs, poetry readings, and future letters.
- Future Letters use a server-clock date lock. Normal archive views withhold sealed bodies and attachments until the opening time. Sealed letters cannot be edited.
- **Full ZIP backups include sealed future letters**, as well as records, settings, progress, and media. Export requires confirmation. The ZIP is a portable JSON/media export, not an encrypted download or a one-click restore system.
- Annual PDFs are generated in the browser as rendered pages. Large exports need sufficient device memory.
- The Version 12 candidate streams full ZIPs to a selected local file on browsers
  offering Save File support. Other browsers retain the ZIP in memory and are
  limited to 256 MiB. The existing classic ZIP encoder does not support ZIP64;
  exports reaching 4 GiB or 65,535 entries stop instead of saving a corrupt ZIP.
- Operational backup policy: keep an encrypted copy quarterly and before/after major data-affecting releases, with a checksum and record-count ledger. Encrypt exported ZIPs separately before storage.
- A source-code bundle is separate from an archive backup and contains no uploaded website data.

## Privacy and access

The application has a **public outer shell** and a **two-user private archive**.

Archive reads, writes, media delivery, and full backups require a trusted ChatGPT Sites runtime identity: a valid user ID and a normalized authenticated email matching the server-side `EDITOR_EMAILS` allowlist. The server-side allowlist is restricted to the designated C and Y accounts; account addresses are managed in runtime configuration.

The code validates membership on the server and denies archive access when membership cannot be established. Signing in alone does not grant membership.

D1 stores private records and R2 stores private media. Protected media GET/HEAD responses use `Cache-Control: private, no-store`, including range delivery. Identity is supplied by the trusted ChatGPT Sites runtime.

Public quiz question text and attempt feedback are intentionally accessible from the outer shell. Configured answers are resolved on the server and are not sent in the public question projection. Guest attempts do not save member progress or grant archive access. Public questions and feedback should contain no private information; built-in poetry is also public.

Site editor/publisher permissions, Site audience, GitHub access, and archive membership are separate. C/Y archive membership grants application-data access without requiring Site editing or publishing rights. Person selectors label contributions rather than establish identity.

The sealed-letter date lock is application access control, not encryption; an authorized full backup can read sealed contents.

## Technology and local development

The application uses **React and Next.js App Router conventions**, **Vinext/Vite**, a **Cloudflare Workers runtime**, **D1** for records, **R2** for media, and **ChatGPT Sites** for hosting and trusted runtime identity. Drizzle manages the data schema; Leaflet provides the map.

Use Node.js 22.13 or newer and npm:

```sh
npm ci
npm run dev
```

Full API development requires isolated local D1/R2 bindings and the local authentication integration. See `vite.config.ts`, `lib/access.ts`, and `lib/server.ts`. Production authentication depends on the trusted hosting boundary.

For application changes, run the relevant isolated checks and build:

```sh
npm run typecheck
npm run check:gift
npm run build
```

Additional focused checks live in `scripts/check-*.mjs`. Integration checks use isolated Miniflare storage and synthetic data. Historical test totals are not current validation results. Browser-specific media, recording, and export behaviour should be checked on the devices used.

The optional wish organizer runs semantic grouping in a browser worker and downloads its model/runtime on first use. Suggestions remain editable. Map tiles come from OpenStreetMap. The planner provides estimates and does not book travel or send scheduled reminders.

## GitHub governance and releases

| Ref | Meaning |
| --- | --- |
| `production` | Canonical source/development branch and base for new feature branches. |
| `main` | Preserved legacy pre-recovery history; not a release or feature-development base. |
| `v11` | Exact deployed Version 11 source: `17d9602c74d1b1c140c08d1b9b95694407cc6a8e`. |

**No production release may be saved or deployed until the exact source commit intended for that release already exists in GitHub.**

```text
production → feature branch → isolated tests/build/security checks
→ PR/review → merge into production → verify exact GitHub source SHA
→ Sites deployment → live verification → immutable release tag
```

The active production ruleset requires PRs, linear history, and resolved discussions, and blocks force pushes and deletion. Use squash or rebase merging. Required approvals are zero for the single-maintainer workflow; automated checks are not currently enforced by the ruleset.

Documentation-only changes use the same PR process but do not trigger a Sites release. Never move `v11` to a later documentation commit. The unrelated legacy and production histories must not be merged or rewritten.

See [Source Governance](SOURCE_GOVERNANCE.md) and the [Phase 4G implementation report](PHASE_4G_GITHUB_GOVERNANCE_IMPLEMENTATION.md).

## History and hosting direction

The earlier birthday-gift application evolved into this shared archive. Earlier changelogs and Phase reports remain historical records; this README describes Version 11.

Current hosting decision: **stay on ChatGPT Sites and prepare a Cloudflare exit plan**. Phase 5 migration remains dormant until a documented trigger and separate authorization. GitHub Pages is not the application runtime; the complete application requires its server, private storage, and identity integration.
