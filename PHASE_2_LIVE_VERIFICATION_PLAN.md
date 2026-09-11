# Phase 2 live verification plan — NOT EXECUTED

Phase 1 stops before deployment. Every production item below is **REQUIRES PHASE 2 LIVE VERIFICATION**. Execute only after explicit Phase 2 authorization. Do not infer success from isolated mock-header tests.

## Deployment preparation for a later approved phase

1. Review the Phase 1 branch and test results. Record the exact approved commit and existing deployed version. Securely record previous runtime values for rollback without publishing secrets in GitHub.
2. Prepare server-only `EDITOR_EMAILS` exactly as `bounniecrisis@gmail.com,changyue960915@gmail.com`. Do not put it in client configuration. PUBLIC_READ can remain at its existing value because it no longer grants data access. This document does not execute that change.
3. Confirm the Sites dispatcher strips/replaces incoming identity headers, forwards a trustworthy user ID and email for both accounts, and prevents direct origin access. Obtain platform evidence; do not assume a request header name proves authenticity. If this cannot be established, stop release approval.
4. Deploy only the separately approved commit/configuration. Do not change Site audience, invite users, grant publisher rights or modify source visibility without separate authorization. If the partner cannot access the required runtime identity, report the blocker; never weaken membership.
5. Retain synthetic canary records for verification only if live test writes have been explicitly authorized. Otherwise use existing records for read checks and label live writes unverified.

Production root: `https://yuliya-love-chihhsing.bounniecrisis.chatgpt.site`.

## Four independent browser profiles

| Profile | Identity | Target |
| --- | --- | --- |
| A | Fresh incognito, signed out | Generic shell/static quiz only; private routes 401 |
| U | A third authenticated ChatGPT account | Generic shell/static quiz only; private routes 403 |
| C | bounniecrisis@gmail.com | Private reads/media and intended writes |
| Y | changyue960915@gmail.com | Same as C, subject to separate letter locks |

Use isolated profiles, not a person selector. Check that U has actually authenticated to the Site; if the platform never forwards identity it may receive 401, which does not establish the outsider 403 case. Record platform login redirects separately from application responses. Neither C nor Y should require GitHub or Site-publishing permissions.

## Read and known-ID test procedure

1. In C, open DevTools → Network, disable browser cache, open Memories and copy the full request URL of one existing photo from `/api/media/<actual UUID>`. Retain it privately as `MEDIA_URL`. Do not publish UUIDs in source/docs or guess IDs. Repeat for an existing video and an ordinary audio/original `/api/assets/<actual UUID>` URL. These are known valid resources, not 404 probes.
2. In each of A/U/C/Y, load the root. Inspect HTML, RSC/hydration responses and Network. A/U may see static quiz and public poems, never personal captions, library poems/comments, wishes, IDs, media URLs or attachments. A/U should not automatically fetch private collections.
3. In each profile navigate to the **exact copied** MEDIA_URL, i.e. `https://yuliya-love-chihhsing.bounniecrisis.chatgpt.site/api/media/<actual UUID copied in step 1>`. A/U must deny; C/Y must render the same valid image. Repeat video and ordinary assets.
4. In that profile's same-origin console, set `const mediaUrl = 'PASTE THE EXACT COPIED MEDIA_URL HERE';` then run the following read-only requests. Do not add or forge identity headers for this browser matrix:

```js
for (const method of ['GET', 'HEAD']) {
  for (const range of [null, 'bytes=0-3', 'bytes=999999999-']) {
    const response = await fetch(mediaUrl, {
      method, credentials: 'same-origin', cache: 'no-store',
      headers: range ? {Range: range} : {}
    });
    console.log(method, range, response.status, {
      cache: response.headers.get('cache-control'),
      nosniff: response.headers.get('x-content-type-options'),
      size: response.headers.get('content-range'),
      length: response.headers.get('content-length')
    });
    await response.body?.cancel();
  }
}
```

A/U: 401/403 before Range evaluation; no private object size, bytes or metadata. A platform-generated error Content-Length, if any, must represent only the denial body, never the protected file. C/Y: 200, 206, 416 respectively, private/no-store and nosniff; HEAD empty. Repeat the same procedure with the copied ordinary asset URL.

5. For each profile manually fetch `/api/photos`, `/api/entries`, `/api/wishes`, `/api/assets`, `/api/journey` with credentials same-origin and cache no-store. A/U deny without IDs/titles/dates/content; C/Y allow. `/api/journey` POST with a valid static question remains temporary for A/U and cannot enumerate/save another person's journey.

## Future Letters and backup

1. With C select existing draft, sealed future-dated and unlocked letters; copy known attachment URLs privately. Do not change dates or publish the IDs.
2. A/U: collection enumeration and direct attachment URLs all deny, including unlocked content. C/Y: shared draft/unlocked behavior retained; sealed body empty, no exposed attachment list, known locked attachment GET/HEAD returns 423, even with Range.
3. Change only a test browser's client clock if feasible: it must not unlock a sealed letter. Verify server time remains the controlling condition. Restore the browser clock afterward.
4. A/U POST `/api/backup` with confirmation must deny before data access. C/Y without confirmation receive 400.
5. Only after specific live-export approval: C exports with confirmation; inspect the downloaded private bundle for records, media and intentionally sealed contents. Fresh ticket works for C, fails for Y/U/A, fails after expiry. Repeat for Y. Do not publish tickets, backup files or private data. No restore is part of this live verification plan.

## Intended writes and poetry workflow

With separately approved synthetic live records, test both C and Y: photo/audio upload, memory CRUD, perspectives, wish completion → memory, nickname and plan editing. Test A/U denial using synthetic payloads only. Never delete existing personal records as a test. Clean up only the explicitly created test records after approval.

For poetry, each member should:

1. Open Our poetry → 收藏詩詞, add title, optional author, multiline text and both comments. Save/reopen and verify persistence across the other member's profile.
2. Change just one comment; the other survives. Open two editors, save one, then try the stale one: a conflict must not overwrite the first save.
3. In Love Letter settings select pages 1–6, copy a collection poem or enter new text directly, save and view after the quiz. Include repeated lines, Chinese punctuation, long text and literal `<script>` text; it must render as text and fit/scroll on mobile.
4. Delete the synthetic collection poem with confirmation: the saved Love Letter copy remains. Reset the page: original static selection returns. Do not reset an existing personal override as a test.
5. A/U receive neither collection/comments nor custom letter poems. Guest static poetry remains functional.

## State loss, caches and initial payload

- After C views private content, sign out or switch to U in the same browser. Trigger a protected fetch/focus refresh. A 401/403 must remove images, captions, comments, private forms and private in-memory state. Stale pending requests must not repopulate them.
- Test native image/audio/video failures, browser back/forward and BFCache, reload and multiple tabs. If old content remains without a new authorization check, record a release blocker; isolated SSR tests do not establish this behavior.
- Request root/RSC and known media first as C, then as A/U from separate fresh profiles. Verify edge/CDN caches do not reuse authenticated capability or private data across users. Check both warm and cold caches and Range errors.
- On 375 px mobile width and enlarged text, verify sidebar remains initially hidden and poetry dialogs/buttons/text remain usable.
- Search A/U response payloads for a privately recorded canary caption/poem/comment from the synthetic fixture; do not copy actual personal text into public reports.

## Release gate and rollback

Record per-profile status, header behavior and redacted evidence. Any unauthorized personal data/media, missing trustworthy identity boundary, letter-lock bypass or shared-cache leakage blocks declaring Phase 2 successful. Y's missing email/ID is an unresolved platform issue, not permission to relax the guard.

Phase 1 has no production rollback to execute. After an approved future deployment, reverting Phase 1 source and restoring prior environment values requires no schema migration but reintroduces known privacy defects. Prefer stopping access under an explicitly approved containment plan while correcting the issue; never silently restore public archive access. Preserve D1/R2 and all newly created poems.
