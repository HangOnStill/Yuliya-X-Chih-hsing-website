# Phase 4G — GitHub Governance Implementation

Repository: [HangOnStill/Yuliya-X-Chih-hsing-website](https://github.com/HangOnStill/Yuliya-X-Chih-hsing-website)

## PRE-MUTATION VERIFIED STATE

- ChatGPT Sites production Version 11 was re-verified against exact GitHub source commit `17d9602c74d1b1c140c08d1b9b95694407cc6a8e`.
- `feature/memory-library-refresh` pointed to that exact commit.
- Legacy `main` pointed to `60d05e5463b02782002c90698f7bea14be252a2f`.
- GitHub comparison reported no common ancestor between legacy `main` and the Version 11 lineage.
- The repository default branch was `main`.
- Neither canonical `production` nor tag `v11` existed.
- No branch-protection rule or repository ruleset existed.

## PRODUCTION BRANCH STATUS

Canonical `production` was created directly at `17d9602c74d1b1c140c08d1b9b95694407cc6a8e`, without a new commit, merge, cherry-pick, force push, or history rewrite.

Two pre-existing slash-namespaced branches prevented creation of a top-level `production` ref. After explicit authorization, they were renamed without changing their target commits:

- `production/v8-baseline` → `archive/production-v8-baseline` at `aab4a5743260252a74030a07e340c2b056c1723a`
- `production/v9-deployed` → `archive/production-v9-deployed` at `fa78244206ef848510990b20b777a3f77296394b`

The source-governance documentation was then merged through PR #1, so `production` legitimately advanced beyond the deployed Version 11 source. That later documentation commit does not redefine Version 11.

## DEFAULT BRANCH STATUS

The GitHub default branch is `production`. Repository visibility was not changed.

## V11 TAG STATUS

Annotated tag `v11` exists. Its tag object is `c982f07984808dd48cf6f14f55241ea6dec69e8e`, and it dereferences exactly to:

`17d9602c74d1b1c140c08d1b9b95694407cc6a8e`

The tag was not moved after later governance commits.

## LEGACY MAIN STATUS

`main` remains unchanged at:

`60d05e5463b02782002c90698f7bea14be252a2f`

It is retained as legacy pre-recovery history and must not be used as a release or feature-development base.

## PROTECTION/RULESET STATUS

Active repository ruleset: **Protect production** (ID `23382303`), targeted only at `refs/heads/production`.

Enforced rules:

- restrict deletion;
- block non-fast-forward updates and force pushes;
- require pull requests;
- require linear history;
- require all review conversations to be resolved;
- require 0 approving reviews, so a single-maintainer repository is not locked behind a nonexistent second maintainer.

Required status checks were not enabled because the production lineage currently has no `.github/workflows` checks to require. Enabling an empty requirement would not add useful assurance. Add a build/test workflow first, then make its stable check mandatory.

## DOCUMENTATION STATUS

`SOURCE_GOVERNANCE.md` records:

- `production` as the canonical verified production lineage;
- `main` as retained legacy pre-recovery history;
- the permanent exact-source-before-deploy rule;
- the required future release workflow;
- the dormant migration status;
- the quarterly and pre/post-major-release encrypted backup policy with checksum and record-count ledger.

Historical Phase 3 and Phase 4 reports were not rewritten.

## FUTURE RELEASE WORKFLOW

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

Permanent rule: **No production release may be saved or deployed until the exact source commit intended for that release already exists in GitHub.**

All new feature branches must originate from `production`. Legacy `main` is reserved for explicitly authorized historical analysis.

## MIGRATION STATUS

Phase 5 remains dormant. No Cloudflare migration branch, preview infrastructure, D1/R2 migration, authentication replacement, DNS change, Site deployment, Site environment change, or production-data mutation was performed.

The current decision remains: **Stay on ChatGPT Sites; prepare a Cloudflare exit plan.**

## Final report

PHASE 3: CLOSED

PHASE 4 DECISION:
STAY ON CHATGPT SITES, PREPARE CLOUDFLARE EXIT PLAN

PRODUCTION VERSION:
11

EXACT V11 SHA:
17d9602c74d1b1c140c08d1b9b95694407cc6a8e

CANONICAL GITHUB BRANCH:
production

DEFAULT BRANCH:
production

V11 TAG:
VERIFIED

LEGACY MAIN:
PRESERVED

GITHUB GOVERNANCE:
COMPLETE

PHASE 5:
DORMANT — NO MIGRATION TRIGGER

NEXT ACTION:
normal feature development from production,
or periodic backup/maintenance

HARD STOP
