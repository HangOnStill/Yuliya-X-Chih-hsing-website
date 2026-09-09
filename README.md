# Yuliya Birthday Gift

A private birthday letter and continuing shared archive for Yuliya × Chih-hsing.

## Source and content

Adapted from the latest recoverable `birthday_gift_v3.zip` (8 September 2026).
The source archive contained six SVG placeholders and no original photographs or final video. No invented photos, captions, memories, or video have been added.
The original six questions, answers, and feedback are kept in `lib/letter-data.ts`.

## Using the gift

- **Love letter**: open the envelope, answer each question beside its paired photograph, enjoy the optional Traditional Chinese vertical poetry, and reach the cinematic video. Progress is saved for each signed-in visitor.
- **Memories**: upload original JPG/PNG/WebP/GIF photos (12 MB each), add a caption/story/date/tags, mark favourites, search, view full size, download originals, and choose the question to pair each photograph with. Identical uploaded bytes are detected automatically. Failed uploads remain available to retry while the page stays open.
- **Wishes**: paste text/links, split on lines or semicolons, review editable cards, and save categories, priorities, status, notes, explicit budgets/currencies, and target dates. Mark a wish complete or reopen it. Repeated saves of the same draft IDs are idempotent.
- **Letter settings**: retain the original poetry or choose three alternative sets, mix verses question by question, toggle envelope/poetry effects, and upload an MP4 surprise (24 MB). Display preferences are local to the current device; photographs and saved wishes are shared within the Site’s access policy.

## Embedded model

`public/wish-ai.worker.js` loads a pinned Transformers.js 3.8.1 browser module and the quantized multilingual `Xenova/paraphrase-multilingual-MiniLM-L12-v2` model on demand. WebAssembly runs in a dedicated worker with one thread. Embeddings suggest categories and semantic duplicates; they do not generate new wish text or fetch product pages. Text splitting and explicitly stated currency/amount extraction are deterministic. Users review suggestions before saving, and may cancel model loading or continue manually. Draft text is not sent to an inference server. The draft text area is retained locally as temporary unsaved input.

The first AI use requires access to jsDelivr and Hugging Face and may download a substantial model. Browser-side model download/inference was not exercised in the authoring environment because outbound network approval was unavailable. The manual workflow and saved-data APIs were verified independently.

## Persistence and access

- Cloudflare D1 binding `DB`: photo metadata, wishlist records, per-viewer quiz progress.
- R2 binding `BUCKET`: original media bytes.
- Every API checks the platform-authenticated visitor header. New publication is private to the owner. Sharing is controlled by the Site access policy; there is no client-only password gate.
- Mutation origins are checked. Media types, file size/signatures, URLs, and input lengths are validated. Edits use revisions to reject stale writes. Photo-question reassignment is a D1 batch; media supports HTTP byte ranges for video seeking.
- Do not edit applied migrations. Generate a new migration when changing the schema.

## Validation

- `node scripts/check-gift.mjs`: integration checks against isolated D1/R2, covering uploads, duplicate uploads, reassignment, byte ranges, authentication, cross-origin mutation rejection, safe URLs, wishlist persistence/idempotency/edits/deletion, revision conflicts, and all six quiz answers including date-format normalization.
- `./node_modules/.bin/tsc --noEmit`: type checking.
- Use the Sites plugin build and packaging workflow for the selected managed-linux execution profile.
- No browser or visual testing was requested or performed.
