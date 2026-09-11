# Phase 1 security test results

Date: 2026-09-11. Branch: `security/private-archive-phase1`.
Baseline: `ebc67d740c6ce9f1501c12feadbb176e93e47fe8`.

| Command | Result |
| --- | --- |
| Baseline `npm run check:gift` before edits | 165 passed, 0 failed |
| Final `npm run check:gift` | **1,391 passed, 0 failed**: 165 continuity + 1,217 privacy/poetry + 9 client checks |
| Final `npm run typecheck` | PASS, exit 0 |
| `node /root/.codex/plugins/cache/openai-curated-remote/sites/0.1.58/scripts/build-site.mjs` | PASS, exit 0; all five Vinext client/RSC/server build stages; dynamic root plus all nine API route patterns |
| `git diff --check` | PASS |

The test runner creates ephemeral Miniflare D1/R2, inserts synthetic fixtures and cleans up locally. No production bindings or data are used. Counts are assertion cases aggregated by the existing runner, not 1,391 independently deployed HTTP scenarios. An intermediate TypeScript syntax error in the new poetry editor was corrected before the final successful checks; it is not an outstanding failure.

## Established in isolated tests

- All 21 private route/method combinations reject anonymous and outsider requests, regardless of PUBLIC_READ true/false/unset/other value.
- Both exact member emails are tested with trusted mock IDs. Missing identity fields, malformed identity values, absent/empty/whitespace/malformed allowlists deny access.
- Poison DB/BUCKET bindings throw on any access: denied route matrices produce **zero storage touches**. Query/body email, cookie and person-selector values cannot grant access.
- Known photo/video/audio/original/letter attachment IDs require membership. GET/HEAD and valid/invalid Range enforce membership first. Denials disclose neither Content-Range nor object Content-Length. Success and error responses use private/no-store and nosniff. Authorized HEAD has no body.
- Both members read collections, upload synthetic images/audio/video, and create/edit/delete intended wishes, memories, perspectives, interests, nicknames, plans and draft letters/attachments.
- Nonmembers cannot enumerate any letters. Authorized shared drafts/unlocked bodies remain available; sealed bodies are redacted and direct locked attachments return 423. A future client-time header does not unlock them.
- Full export requires membership and confirmation. Sealed content intentionally included. Fresh ticket allows only its bound member; outsider/anonymous/other-member/expired-ticket cases deny. Existing backup serialization and media coverage tests retained.
- Poetry: each member creates poems, updates one comment without destroying the other, hits revision conflict on stale save, copies a poem to a page, rejects duplicate page overrides, out-of-range page and blank text. Full export includes poems/comments/overrides. Deleting the collection preserves the letter copy; direct letter text update/reset work through protected entries.
- Actual React server rendering produces public shell for anonymous and outsider capabilities without private media URLs/collections. Member initial render also embeds no personal records. Shared JSON/binary denial notifications revoke client capability. User-added strings are rendered as React text, not HTML.
- Original guest quiz feedback/temporary progress, static poetry, wish-to-memory, HEIC original handling and existing Future Letter assertions remain covered. Insecure historical public GET assertions were replaced with explicit 401 tests, not removed silently.

## Limits and remaining uncertainty

**REQUIRES PHASE 2 LIVE VERIFICATION:** Yuliya's external invitation, forwarded email and stable Sites ID; production identity-header sanitation and origin isolation; production edge/RSC/browser caching; actual anonymous/third-account media denial and both-member production writes.

SSR and event-helper checks are not a hydrated browser account-switch test. Browser state removal, BFCache/back navigation, native media errors, phone layout and complete poetry editing interactions remain manual checks. No actual browser microphone, HEIC decoder, PDF layout or model download validation was added. No production backup was created/restored. Backup is still portable JSON/media, not a tested one-click restoration system.

Build emitted non-blocking proxy-environment, plugin timing and >500 kB chunk warnings. No unrelated chunk optimization or dependency update was attempted.

## Decision

READY for a separately authorized Phase 2 deployment and live verification. This is not a claim that production privacy has changed or that platform identity trust has been proven. No push, merge or deployment occurred.
