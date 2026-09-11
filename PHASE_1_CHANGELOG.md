# Phase 1 changelog

Date: 2026-09-11. Status: implemented and isolated verification passed; NOT deployed, pushed or merged.

Baseline commit: `ebc67d740c6ce9f1501c12feadbb176e93e47fe8`. Dedicated branch: `security/private-archive-phase1`. Baseline `npm run check:gift`: 165 passed, 0 failed. Before editing, expected changes were the shared access/server layer, affected routes and client callers, isolated tests and documentation. The user's subsequent request explicitly added the poetry library, two comments and custom Love Letter poems to the implementation scope.

## Security behavior

Before: PUBLIC_READ could bypass private GET authorization; otherwise a user ID sufficed for reads, and an empty editor list could fail open. Known media IDs could expose archive bytes. Hidden client sections fetched collections. Some 416 paths omitted private cache headers.

After: `api()` → `authorize()` → `requireArchiveMember()` → trusted ID + validated email → `isArchiveMember()` → valid server EDITOR_EMAILS membership. Anonymous/incomplete identity receives 401; authenticated nonmember or unusable allowlist receives 403, before data lookup. PUBLIC_READ cannot grant archive access. Both intended members have equal application read/write permissions. This does not verify the production dispatcher and does not alter production.

Future Letter server-clock locks and explicit, user-bound expiring backup tickets are preserved. An unlocked letter remains private. Both members may see shared draft bodies as before; sealed bodies/attachments stay locked outside intentional full backup. Public quiz POST remains stateless for nonmembers; private Journey GET is protected.

## Every modified or added file

| File | Finding/scope | Before → after and reason |
| --- | --- | --- |
| lib/access.ts | F01/F03 | Public-read and permissive editor decisions → canonical fail-closed normalized membership and trusted ID/email parser. |
| lib/server.ts | F01/F02/F03/F04 | GET bypass → all private methods use one guard; extracted consistent error response for narrow public quiz. |
| app/chatgpt-auth.ts | F03/F06 | ID-only identity → shared ID/email validation. |
| app/page.tsx | F06 | Edit-only prop → server-derived archive capability; retains dynamic public shell with static text only. |
| app/api/journey/route.ts | F01/F03 | Broad public-quiz wrapper exception → only validated POST feedback public; nonmembers never touch D1. GET private. |
| app/api/media/[id]/route.ts | F02/F07 | Inconsistent 416 headers/implicit HEAD → private no-store/nosniff 416 and explicit guarded HEAD. |
| app/api/assets/[id]/route.ts | F02/F04 | Implicit HEAD → explicit HEAD using the same guarded GET and letter lock checks. |
| lib/v5-server.ts | F07 + poetry | Consistent 416 cache headers; unique per-page letter-poem key using existing index. Letter lock and ticket logic unchanged. |
| lib/archive-client.ts | F06 | New shared 401/403 capability-revocation event. |
| lib/wish-drafts.ts | F06 | Request error only → notify revocation before processing protected denial. |
| lib/keepsake-export.ts | F06 | Binary export error only → also notify revocation; backup format unchanged. |
| app/birthday-gift.tsx | F06 + poetry | Hidden private children still mounted → capability-gated children and fetches, keyed remount clears state on denial. Adds private poem collection/settings and per-page custom text. |
| app/gift-sidebar.tsx | Requested poetry | Adds Our poetry tab, preserving existing tab order. |
| app/poetry-library.tsx | Requested poetry | New collection CRUD/search, separate comments, revision conflicts, deletion confirmation, six-page direct-text or collection-copy editor. |
| lib/v5-models.ts | Requested poetry | Adds validated poem/letter-poem entry variants with bounded text/comments, page 0–5. No schema migration. |
| app/v5.css | Requested poetry | Scoped poem wrapping, scrollable text and comment layout; original static poetry style preserved. |
| scripts/check-gift.mjs | F01–F07 | Explicit two-member test config; insecure public expectations replaced with denial assertions, guest POST retained; runs new suites. |
| scripts/check-privacy.mjs | F01–F07 + poetry | New isolated authorization matrix, poison-binding checks, both-member CRUD/media/backup/locks and poetry regression cases. |
| scripts/check-client-privacy.mjs | F06 | New real React SSR checks and actual request/event helper checks. |
| README.md | F01/F03 + poetry | Replaces public archive guidance with public shell/private archive configuration and verification limits; documents poetry. |
| PHASE_1_CHANGELOG.md | Required deliverable | This implementation and rollback record. |
| PHASE_1_SECURITY_TEST_RESULTS.md | Required deliverable | Commands, results and coverage limits. |
| PHASE_2_LIVE_VERIFICATION_PLAN.md | Required deliverable | Prepared, unexecuted live verification and configuration checklist. |

## Poetry behavior

Poems and comments are protected `entries` data, not static source text or localStorage. Both members may edit either attributed comment. Each Love Letter page stores an independent snapshot; deleting or editing the collection does not change that copy. Direct text can be entered without first creating a collection record. Reset deletes the page override and restores its static poem selection. Existing full backup includes both kinds and comments automatically; one-click restore remains unimplemented.

## Scope and rollback

No dependencies, lockfile, SQL schema/migrations, media processing, hosting configuration, live environment, D1/R2 objects or production audience were changed. No source/ publishing rights were granted. Production remains the previously deployed version and must not be represented as repaired yet.

All files above can be reverted together by reverting the Phase 1 commit on this branch. Before deployment there is no production rollback to perform. A future deployment rollback would revert the Phase 1 commit(s) and restore the securely recorded previous environment values; no data migration is required. Restoring the old authorization code would reopen known exposure and must not be treated as a safe privacy rollback. After new poem records have been created, old code may not display those kinds; preserve them in D1 and the full backup, rather than deleting data.
