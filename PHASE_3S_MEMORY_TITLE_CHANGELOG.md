# Phase 3S Memory title changelog

Feature branch: feature/letter-memory-titles. Base: exact Version 8.

- lib/letter-titles.ts: immutable six Version 8 defaults and one capability-aware resolver.
- lib/v5-models.ts: strict letter-title model, page 0–5, trimmed subtitle up to 80 (empty allowed), main title 1–160.
- lib/v5-server.ts: unique per-page dedupe key; existing revision/CRUD authorization unchanged.
- app/letter-title-settings.tsx: six member-only editors, captured revision, save, confirmed reset by deletion, explicit load-latest/discard-draft on external changes. Retains drafts instead of overwriting them on refresh.
- app/letter-chapter-heading.tsx: React text rendering of resolved fixed chapter identifier and editable titles.
- app/birthday-gift.tsx: shared resolver feeds headings, fallback caption, chapter navigation and poetry selectors; settings loaded only for members after entries load; initial focus moves to close button rather than input.
- app/memory-archive.tsx: photo pairing choices use same resolved titles; independent personal photo captions remain unchanged.
- lib/keepsake-export.ts: paired photo PDF pages include resolved chapter label; existing photo title is retained.
- app/v5.css: wrapping, scrollable settings and flexible mobile actions.
- scripts/check-letter-titles.mjs and scripts/check-gift.mjs: 92 new isolated checks, no previous assertions removed.
- README.md: private-title semantics and permanent exact-source GitHub release policy.
- Four PHASE_3S/3V Markdown documents: provenance, changes, verification and deployment gate.

Generic entries backup automatically includes titles. No SQL migration, new dependency, source default mutation, authorization modification or production operation. Reset restores page 6 to MEMORY 06 / 一生 / Our Life to Come. No title values are stored in localStorage.

Rollback before deployment: retain production Version 8 and do not deploy this candidate. Later code rollback may revert the feature commit without deleting data; do not restore historical insecure pre-Phase-1 authorization.
