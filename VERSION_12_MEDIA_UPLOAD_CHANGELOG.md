# Version 12 large-media upload — candidate report

## September 15 follow-up: owner-requested limits without tests

Version 12 was deployed successfully from `f1dcf30fef1763d274bf92f8cac09355c86e0ae1`
at 2026-09-15T13:55:40Z, environment revision 2. Site version ID:
`appgprj_6aa12247f6c481919289d2920d777d01~appgver_32b2506599508191990b13c0aa5b9cf9`;
deployment `appgdep_6aa94e50ea60819183948f49be458632`.
The exact merged source passed 2,932 checks, typecheck and build before deployment.

Before any synthetic live upload, the owner superseded the planned probes:
increase photos to **20 MiB** and videos to **150 MiB**, without tests. Audio stays
at **60 MiB**. This follow-up changes the shared client/server policy and UI only,
plus documentation and the multipart buffer comment (up to 30 sequential parts).
The streaming architecture, raw HEIC 24 MiB, unrelated limits, schema, audience
and authentication remain unchanged. Necessary release builds are not upload tests.

**No automated tests or live size probes were run for the 20/150 MiB follow-up.**
The earlier 2,932 checks apply only to the 15/60/100 MiB baseline and must not be
represented as verification of 20/150 MiB. Verified production upload ceiling:
**unknown**. No synthetic live objects were created; no cleanup is required.
No `v12` release tag is created because the original live-verification gate was
not completed. A subsequent save/deploy receives a new Sites version number.

The rest of this document is the historical Version 12 candidate report, with
its original 15/60/100 MiB targets and now-superseded pending test plan.

## SOURCE BASE

- Repository: HangOnStill/Yuliya-X-Chih-hsing-website.
- Canonical branch: `production`; candidate: `feature/v12-large-media-upload`.
- Fetched base: `314ae3c6a3d7208022ac93fc383591f17979cef6`.
- Exact Version 11 source remains `v11` → `17d9602c74d1b1c140c08d1b9b95694407cc6a8e`.
- No legacy `main`, `v11`, schema, dependencies, identity configuration, audience,
  hosting bindings, or migration changes are included.

## IMPLEMENTATION ARCHITECTURE

The audited previous upload route accumulated all incoming chunks and copied them
into another full byte array. It allowed ordinary images at 12 MiB and audio/video
at 24 MiB. The client HEIC source ceiling was 24 MiB; its converted display image
was limited to 12 MiB. Generic assets, voice/letter attachments, and the dedicated
surprise-video path remain at their existing 24 MiB ceiling (Future Letter image
preparation retains its existing 12 MiB display limit).

Only Add memories selects the new `memory-library` upload scope. The endpoint
still authorizes membership and same-origin writes before reading private bytes
or touching storage. R2 holds binaries; D1 retains the existing metadata schema.

## PHOTO LIMIT / AUDIO LIMIT / VIDEO TARGET

| Add memories type | Application limit | Implementation |
| --- | --- | --- |
| JPEG, PNG, WebP, GIF / converted HEIC JPEG | 15 MiB | Existing bounded image validation/hash path |
| MP3, M4A/MP4, WAV, OGG, WebM audio | 60 MiB | Bounded streaming |
| MP4, WebM video | 100 MiB | Bounded streaming |

One MiB is 1,048,576 bytes; UI MB labels use this unit. Raw HEIC/HEIF stays at
24 MiB. Filename status and actionable upload errors are displayed. Successful
queue items are preserved and skipped on retry. Codec playback remains dependent
on the browser; signature checks are not full-file codec validation.

## VERIFIED VIDEO LIMIT / LIVE SIZE-PROBE RESULTS

**Not yet established for Version 12 on Sites.** No 100 MiB production claim is
made. The owner approved deploying the GitHub-preserved, fully tested candidate
before progressive synthetic probes because Version 11 rejects >24 MiB itself.

Pending probes: 25, 40, 60, 80, 100 MiB. Record HTTP status, application vs upstream
rejection evidence, metadata/media existence, and cleanup for each. Do not infer
invisible R2/D1 state from a generic gateway error. If an upstream ceiling is
observed, stop and establish a conservative verified value before release.

## STREAMING STRATEGY / HASH-DEDUP STRATEGY / MEMORY BEHAVIOR

- A 4 KiB prefix validates MP4 `ftyp` structure or bounded EBML header with WebM
  DocType. Existing audio signatures are preserved. Arbitrary renamed bytes fail.
- SHA-256 uses native incremental `node:crypto` `createHash`, already supported by
  the runtime's `nodejs_compat`; no new hashing dependency or fictional streaming
  Web Crypto API is used.
- Declared oversize is rejected before reads/storage. Actual streamed bytes are
  counted independently, with cancellation and 413 on crossing the ceiling.
- Known Content-Length uses a backpressured `FixedLengthStream` directly into R2
  `put`. Length mismatch fails closed. No full-video Blob/ArrayBuffer/base64/JSON,
  tee, or second full copy is used.
- R2 rejects arbitrary unknown-length streams in the isolated runtime. Missing
  length therefore uses sequential 5 MiB multipart parts, at most 20 completed
  part descriptors at the video limit, and abort on failure.
- Expected application buffering: 4 KiB prefix plus current incoming chunk and
  native stream/hash queues; unknown-length fallback additionally has a 5 MiB
  part buffer (a retiring uploaded part may remain until garbage collection).
  Neither path intentionally retains the whole upload. This is a buffer bound,
  not a measured guarantee of total isolate RSS or R2's internal memory.
- Generated tests use <=64 KiB input chunks and counting sinks. A real isolated
  workerd/R2 test processes 100 MiB known-length media and verifies stored size,
  suffix reads, digest shape and deletion, without reading the full object back.

Official platform evidence (not a Sites-specific ceiling):
[Workers limits](https://developers.cloudflare.com/workers/platform/limits/),
[R2 Workers API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/),
[FixedLengthStream](https://developers.cloudflare.com/workers/runtime-apis/streams/transformstream/),
[Node crypto](https://developers.cloudflare.com/workers/runtime-apis/nodejs/crypto/).
Workers documents 128 MB isolate memory and account-dependent request limits;
actual Sites ingress must still be measured independently.

## R2 CLEANUP / ATOMICITY

Bytes are private under a unique key until metadata insertion. Duplicate digest
and concurrent unique-digest races discard the new object and return the existing
record. Stream/signature/size/storage failures abort unfinished multipart work and
delete any completed key. A lookup failure before an insert attempt also deletes
the new key. An insert failure is reconciled by ID before deletion so a committed
record is not left pointing at deleted bytes. Confirmed inserts are preserved if
only the final response read fails.

D1 and R2 are not a cross-service transaction: a simultaneous ambiguous insert
and unavailable reconciliation read, or unavailable cleanup service, cannot be
claimed atomic. In that exceptional outage, preserving potentially committed
bytes is safer than deleting valid media; operational reconciliation may be needed.
No schema migration or background cleanup authority is introduced silently.

## AUTOMATED TEST RESULTS

The gate extends (does not replace) existing regression checks. Coverage includes
15/60/100 MiB ±1 boundaries, missing/forged lengths, signatures and MIME spoofing,
incremental digest, storage failures, duplicate behavior, D1-failure cleanup,
anonymous/outsider/cross-origin denial, GET/HEAD/Range privacy, backup inclusion,
native R2 streaming, and bounded ZIP writes. Synthetic binaries are generated,
not committed. Final exact-candidate gate results will be recorded after merge.

## PRIVACY RESULTS

Isolated privacy regression: passing in the candidate test run. Trusted runtime
identity, exact two-member allowlist, same-origin checks, private/no-store media,
GET/HEAD/Range and metadata preloading are unchanged. Live C/Y, anonymous and
outsider verification of newly uploaded large objects is still pending.

## BACKUP RESULTS

Full ZIP media reads now apply disk-writer backpressure where Save File is
available. Generated 100 MiB backup passes with <=64 KiB sink writes; a small ZIP
is decoded to verify content and exclusion of export tokens. Cancellation,
authorization loss, and incomplete media abort the output rather than silently
omitting data. The no-file-picker Blob fallback is explicitly capped at 256 MiB.
Classic ZIP limits are guarded; ZIP64/whole-backup redesign is out of scope.
PDF behavior is unchanged. Live backup checks are pending.

## GITHUB SHA / SITE VERSION / RELEASE STATUS

- Candidate merged SHA: pending.
- Site: Version 11 remains deployed until the candidate is preserved and tested.
- Version 12 deployment/version IDs, environment revision and time: pending.
- Release status: IN PROGRESS; `v12` not created.
- Live verification and synthetic cleanup: pending.
- Phase 5 / migration: NOT STARTED.
