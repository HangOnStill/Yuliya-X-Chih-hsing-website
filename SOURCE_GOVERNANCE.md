# Source Governance

## Canonical lineage

- `production` is the canonical, verified production lineage and the base for all new feature work.
- `main` is retained as the legacy pre-recovery lineage. Do not use it as a release or feature-development base; use it only for specifically authorized historical analysis.
- The two lineages must not be joined through force pushes, unrelated-history merges, synthetic merges, or history rewriting.

## Permanent release rule

**No production release may be saved or deployed until the exact source commit intended for that release already exists in GitHub.**

Version 11 is permanently identified by the annotated tag `v11`, which points to deployed source commit `17d9602c74d1b1c140c08d1b9b95694407cc6a8e`. Later governance or documentation commits on `production` do not change the identity of that release.

## Required workflow

```text
production
  → feature/*
  → isolated tests, build, and security checks
  → pull request and review
  → merge into production
  → verify the exact remote production SHA
  → save/deploy that exact ChatGPT Sites version
  → live verification
  → immutable annotated release tag
```

All new feature branches must originate from `production`. Do not branch from legacy `main` except for explicitly scoped historical analysis.

## Hosting and migration

Current decision: **Stay on ChatGPT Sites; prepare a Cloudflare exit plan.** Phase 5 is dormant. No migration trigger is active, so do not create migration infrastructure, migrate D1/R2, replace authentication, or change DNS without separate authorization.

## Backup policy

Maintain an encrypted full ZIP backup with checksum and record-count ledger:

- quarterly; and
- immediately before and after any major data-affecting release.

This policy is operational maintenance, not a migration trigger.
