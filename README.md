# Y X C — Yuliya Birthday Gift V5.1

A love letter first, and a home for the memories and wishes that follow.

**[Open the full website](https://yuliya-birthday-gift.bounniecrisis.chatgpt.site)** · [Source repository](https://github.com/HangOnStill/Yuliya-X-Chih-hsing-website)

V5 brings back V3's centered letter, animated heart, clean layout and gentle scroll when opening the envelope, with V4's photo archive, wish organizer and letter settings. The love letter is the default page; other spaces live in a responsive sidebar. The heart uses the original CSS animation, so no GIF download is needed. Reduced-motion preferences are respected.

The header now has a visible hide/show sidebar button and remembers this device's choice. The sidebar order starts with Love letter → Memories → Keepsakes → Wishes → Our nicknames. Ctrl/⌘ + B also toggles the sidebar outside text-entry fields.

## Included features

| Space | What you can do |
| --- | --- |
| Love letter 情書 | Answer six questions, unlock matching photographs, choose among four sets of six classical poetry pairings, and adjust display settings. |
| Memories 記憶庫 | Upload and organize photographs, search captions, associate photos with the questions, and keep dated memory chapters. |
| Two perspectives | Write Yuliya's and Chih-hsing's feelings separately for a photograph and read both together. |
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

The existing website retains its private access settings. A public source repository does not publish stored photos or recordings. To use it together, the owner must grant the intended partner access through the site's sharing controls. The Yuliya/Chih-hsing selectors attribute contributions; they are not separate authenticated identities or private account boundaries. Authorized viewers share the archive and can edit its records.

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

V5.1 passed TypeScript checking and 141 isolated integration assertions covering journey continuity, revision conflicts, wish-to-memory transactions, separate perspectives/collections, future-letter locks, attachment access, backup authorization, HEIC original preservation and planning calculations, nickname stories and their backup inclusion. Production building is part of release preparation. Actual browser microphone capture, HEIC decoding, PDF layout and the first model download were not exercised by those server checks.

See [CHANGELOG.md](CHANGELOG.md), [GitHub access steps](docs/GITHUB_ACCESS.md), and [future ideas](docs/ROADMAP.md).
