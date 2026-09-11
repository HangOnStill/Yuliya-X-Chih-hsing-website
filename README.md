# Y ♥ C — Yuliya Birthday Gift V5.2

A love letter first, and a home for the memories and wishes that follow.

**[Open the full website](https://yuliya-birthday-gift.bounniecrisis.chatgpt.site)** · [Source repository](https://github.com/HangOnStill/Yuliya-X-Chih-hsing-website)

V5 brings back V3's centered letter, animated heart, clean layout and gentle scroll when opening the envelope, with V4's photo archive, wish organizer and letter settings. The love letter is the default page; other spaces live in a responsive sidebar. The heart uses the original CSS animation, so no GIF download is needed. Reduced-motion preferences are respected.

The header has a visible hide/show sidebar button. The sidebar starts hidden on every visit. The Love Letter page uses 26 more visible rose-colored floating hearts (18 on phones), with varied sizes and gentle sideways drift. Phone layouts include 44–48 px touch targets, stacked narrow forms, safe-area spacing, and scrollable dialogs. Opening the letter does not automatically raise a phone's keyboard. The sidebar order starts with Love letter → Memories → Keepsakes → Wishes → Our nicknames. Ctrl/⌘ + B also toggles the sidebar outside text-entry fields.

## Included features

| Space | What you can do |
| --- | --- |
| Love letter 情書 | Answer six questions, unlock matching photographs, choose among four sets of six classical poetry pairings, and adjust display settings. |
| Memories 記憶庫 | Upload and organize photographs, search captions, associate photos with the questions, and keep dated memory chapters. |
| Two perspectives | Write Yuliya's and Chih-hsing's feelings separately for a photograph and read both together. |
| Our poetry 詩詞庫 | Collect poems, two comments and private custom poetry for each Love Letter page. |
| Our nicknames 暱稱小本 | Collect nicknames for each person, their origins, an optional first-use date and funny moments. Search, filter, read, edit and include them in full backups. |
| Wishes 願望 | Collect and classify ideas, edit dates/budgets/links/notes, keep individual collections, and filter their shared intersection. |
| Wish → memory 願望變回憶 | Complete a wish with a date, photographs and reflection. Its memory and completed status save together. |
| Our plan 生活計畫 | Build and edit a twelve-month reunion timeline using chosen wishes, available time and savings/budget estimates. |
| Future letters 給未來的信 | Save a draft with photos/audio, choose the unlock date/time, and seal it. The server withholds the body and attachments until that moment. |
| Our story 相遇地圖 | Add places and coordinates to memories, browse map pins and chronological chapters, or click the map to begin a chapter. |
| Keepsakes 紀念冊 | Download an annual PDF with photos, poetry, both perspectives and completed wishes. Export the full archive as a ZIP. |
| Voice letters 聲音情書 | Record a photo narration or a reading of a selected poem, preview it, then save. Existing audio files can also be uploaded. |

The supplied V3 source contained placeholder illustrations, not actual photographs or a final video. Upload these through the website. V5 does not invent personal media. Existing V4 records are preserved by an additive migration.

## Local wish AI

The optional browser worker uses Transformers.js and `Xenova/paraphrase-multilingual-MiniLM-L12-v2` embeddings to suggest categories and group similar wish drafts. It is a semantic organizer, not a generative chat model. Suggestions remain editable and are reviewed before saving. Manual entry works without the model.

First use downloads the runtime/model from jsDelivr/Hugging Face and may take time or fail on a restricted network. Wish text is embedded on the device. OpenStreetMap tiles load when the map opens; requests disclose ordinary request metadata and the viewed area to the tile provider.

## Media and exports

- Archive JPEG/PNG/WebP/GIF: up to 12 MiB. HEIC/HEIF input: up to 24 MiB, converted locally. Archive uploads retain the display JPEG and original HEIC. Unsupported variants show an error; retry with a JPEG.
- Future-letter HEIC attachments are converted to JPEG without separately retaining their HEIC original.
- Audio/attachments: up to 24 MiB. Browser recordings stop after two minutes. Microphone access requires permission and HTTPS or localhost. Recording formats depend on the browser.
- Final-video support is retained, up to 24 MiB. Media endpoints support byte ranges.
- Annual PDF generation runs in the browser and uses the device's Chinese fonts. Rendered pages are images in a PDF, not searchable text. Large albums need sufficient device memory.
- Full backup contains original archive media, video, audio, wishes, perspectives, plans, memories, nicknames, quiz progress, settings and **sealed future letters**. Temporary export authorization is excluded from the ZIP. This is a portable JSON/media export; one-click restore is not implemented. Keep the backup private.
- The source-code bundle is separate: it contains no uploaded website data.

## Access and hosting

The full app uses React, Vinext, a server worker, D1 for records and R2 for media. GitHub Pages serves only the small entrance in `docs/`, linking/redirecting to the full website. It cannot run the API, database or future-letter access checks.

Phase 1 implements a public UI shell with an allowlisted private archive. Every private API read/write, media GET/HEAD and full export requires a trusted Sites user ID **and** normalized authenticated email matching server-side `EDITOR_EMAILS`. Authentication alone is insufficient. Missing, empty, whitespace-only or partly malformed allowlists deny all archive access. `PUBLIC_READ` remains compatible configuration but no longer authorizes archive access, regardless of its value.

The intended production configuration is exactly `EDITOR_EMAILS=bounniecrisis@gmail.com,changyue960915@gmail.com`, configured only on the server. This is a Phase 2 configuration requirement, not an executed production change. Both members have intended read/write permissions. Anonymous visitors receive 401; authenticated outsiders receive 403. The narrowly public `/api/journey` POST checks static quiz answers and stores no guest progress; Journey GET remains private. The client does not mount private collections for guests and discards private in-memory component state on a protected 401/403.

GitHub/source access, Site editing/publishing, Site viewing and application-data membership are separate permissions. Neither member needs GitHub or publishing rights to edit application data. Person selectors label contributions, not authenticated identities. Sites viewing rules can additionally limit who opens the shell. The dispatcher must strip/replace visitor identity headers and prevent direct-origin bypass; external-user identity forwarding and production caching require Phase 2 live verification.

A sealed letter has an application-level date lock, not encryption. Authorized full-backup export deliberately includes sealed content after an explicit confirmation. Unlocking uses the server clock; the editor converts local time to UTC. Sealed letters cannot be rewritten; create a new draft to replace one.

The planner provides editable suggestions. It does not book travel, send reminders, obtain visas, verify immigration rules or convert currencies. Enter actual locations, constraints and costs. Different-currency wish estimates are flagged for manual conversion.

## Development

Requirements: Node.js 22.13+ and npm. Dependencies are pinned in the lockfile.

```sh
npm ci
npm run dev
```

The portable command uses Vinext on port 5173. Managed Sites checkouts keep their execution profile in an ignored local directory; a clean clone uses the portable profile automatically. Full API functionality needs the hosting platform's D1 `DB`, R2 `BUCKET` and trusted authentication integration. Apply SQL migrations in `drizzle/` in order. See `app/chatgpt-auth.ts` and `lib/server.ts` for the host authentication contract; never trust visitor-supplied identity headers.

```sh
npm run typecheck
npm run check:gift
npm run build
npm run bundle -- /absolute/path/Yuliya_V5_Bundle.zip
```

Integration checks use an isolated Miniflare database/bucket, never live content. The bundle exports committed source, so commit intended changes first. A downloaded ZIP uses `SOURCE_FILES.json` as its explicit file list. Dependencies, credentials, build output and uploaded data are excluded.

## Deployment

For the existing Sites project, reuse `.openai/hosting.json`, build, push the exact source commit to its configured source repository, package the build, save a version and deploy to the existing audience. A deployment to another host needs its own database, bucket and authentication. The project reference is not a credential.

For the GitHub entrance, select **Settings → Pages → Deploy from a branch → main → /docs → Save**. The Pages URL becomes available after GitHub finishes deployment. No API keys or database belong in the entrance page.

## Validation and limits

Phase 1 passes 1,391 isolated checks (165 continuity checks, 1,217 privacy/poetry regression checks and 9 client SSR/denial-signal checks). Tests use ephemeral Miniflare D1/R2 and synthetic media. Both configured identities are simulated at the trusted boundary; this does not verify production identity forwarding. Actual browser account switching, microphone capture, HEIC decoding, PDF layout and first model download remain manual checks.

See [CHANGELOG.md](CHANGELOG.md), [GitHub access steps](docs/GITHUB_ACCESS.md), and [future ideas](docs/ROADMAP.md).

## Phase 2 configuration and live verification

Do not deploy this Phase 1 branch automatically. After explicit Phase 2 approval, configure the exact server-side membership list above and verify anonymous, outsider and both member accounts against collections and known media URLs. Verify the dispatcher's trusted identity boundary before declaring production protected. Changing GitHub visibility does not change runtime privacy. Previously downloaded public content cannot be recalled.

Optionally restrict the Site audience separately after approval. External invitation, forwarded email and stable user ID remain **REQUIRES PHASE 2 LIVE VERIFICATION**. Do not weaken archive membership to accommodate missing identity information.

## Our poetry · 詩詞庫

Members can collect a title, optional author, poem and separate Yuliya/Chih-hsing comments; both members may edit either comment. Search covers poem text and comments. In Love Letter settings, select one of six pages and either copy a saved poem or enter a new poem directly. Each saved page keeps an independent snapshot; editing/deleting the library entry does not change that page. Restore the original poetry selection with its reset button. New direct text can separately be added to the library.

Library poems, comments and custom letter poems use protected entry records and are included in the existing full archive export. They are not embedded into public initial HTML or browser preferences. Original static poetry remains public. No database migration or backup-format change is needed.
