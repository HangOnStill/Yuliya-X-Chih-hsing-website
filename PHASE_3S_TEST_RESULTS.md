# Phase 3S test results

Isolated checks: npm run check:gift — PASS, 1,483 assertions, zero failures (previous 1,391 + 92 new). npm run typecheck — PASS. npm run build — PASS. git diff --check — PASS. Tracked source is committed only after these checks.

New checks: exact six defaults and fixed identifiers; both members create/read/update/delete; anonymous and outsider GET/POST/PATCH/DELETE denial with PUBLIC_READ=true; missing/empty/whitespace/malformed membership rejection; duplicate page, invalid/fractional page, unknown fields, blank main title, bounded lengths; blank Chinese subtitle accepted; Unicode and punctuation; stale revision 409; page reassignment rejection; independent pages; full-backup inclusion; page-6 default/override/reset; real heading component SSR with script text escaped and guest default fallback.

Existing 1,217 privacy tests and 9 client privacy checks remain intact as part of the original 1,391. Miniflare uses ephemeral synthetic D1/R2 and injected isolated trusted identities; no production storage requests. No dependencies installed or changed. Existing build warnings about proxy configuration/chunk sizes are nonfatal.

Surface audit: headings/navigation/settings/photo-pairing consume one resolver. PDF adds chapter label using resolver and textContent-based element helper. Full browser/PDF visual rendering, mobile 375px interactions, concurrent UI editing and logout/BFCache still require live or browser verification; these are not claimed tested. No Edge/browser actions in this phase.

GitHub push failed due absent Git transport credential, not a test failure. Candidate preservation in GitHub is a blocking deployment prerequisite. Local branch and commit do not constitute successful remote push.
