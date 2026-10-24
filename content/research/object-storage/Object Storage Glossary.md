# Object Storage Glossary

Optional reference for rereading. Each term links to the note that explains it properly. Back to [[_ Object Storage Hub]].

| Term | One-line meaning | Explained in |
|---|---|---|
| Object storage | A durable key → bytes store accessed over HTTP; ordinary buckets replace whole objects rather than editing in place | [[01 What Object Storage Is and Why It Exists]] |
| Bucket | A named container of objects; usually one per app per environment | [[01 What Object Storage Is and Why It Exists]] |
| Object | The stored bytes plus a little metadata (size, Content-Type, ETag, custom headers) | [[01 What Object Storage Is and Why It Exists]] |
| Key | The object's name in the bucket; slashes are just characters ("prefixes"), not folders | [[01 What Object Storage Is and Why It Exists]] |
| Prefix | The start of a key, used to group and list objects (`files/42/`) | [[01 What Object Storage Is and Why It Exists]] |
| ETag | Entity tag: changes when content changes; good for comparisons and conditional requests; **not** a reliable MD5/checksum (multipart and some encryption modes differ) | [[01 What Object Storage Is and Why It Exists]] |
| Checksum fields | Explicit integrity values (e.g. CRC32C, SHA-256) you can send and verify; use these, not ETags, for integrity | [[01 What Object Storage Is and Why It Exists]], [[04 Browser Uploads in Practice]] |
| API operation vs HTTP verb | `PutObject`/`GetObject`/`HeadObject`/`DeleteObject` map to PUT/GET/HEAD/DELETE; `ListObjectsV2` is a GET on the bucket with query parameters | [[01 What Object Storage Is and Why It Exists]] |
| Durability | Engineering target for not losing data (S3: designed for eleven nines); not a backup, and no protection from your own deletes | [[01 What Object Storage Is and Why It Exists]] |
| Availability | Whether you can reach data right now; fails independently of durability | [[01 What Object Storage Is and Why It Exists]] |
| Erasure coding | Storing data as fragments plus parity so it can be rebuilt from a subset; cheaper than full copies | [[01 What Object Storage Is and Why It Exists]] |
| Strong consistency (S3) | After a successful write, the storage API's reads and lists see it (since 2020). Doesn't refresh CDN caches, make DB + bucket updates atomic, or provide multi-object transactions | [[01 What Object Storage Is and Why It Exists]] |
| Egress | Bytes sent out to the internet (downloads, views); often the unpredictable part of the bill | [[01 What Object Storage Is and Why It Exists]], [[02 How S3 Became the Convention]] |
| Control path / data path | Decisions and records (your server + DB) vs the actual bytes (browser ↔ storage or CDN) | [[01 What Object Storage Is and Why It Exists]] |
| Presigned URL | A URL carrying a signature your server computed; allows one operation on one key until expiry; a **reusable bearer permission**, not single-use | [[04 Browser Uploads in Practice]] |
| HMAC | A keyed hash used to sign requests; shows the request was authorized by someone holding the credentials | [[04 Browser Uploads in Practice]] |
| Temporary credentials | Short-lived, scoped credentials (e.g. from an IAM role); URLs signed with them stop working when they expire | [[04 Browser Uploads in Practice]] |
| Presigned PUT | Upload raw bytes to a signed URL; broadly supported; no size range | [[04 Browser Uploads in Practice]] |
| Presigned POST / POST policy | Form-style upload whose signed *conditions* (e.g. size range) storage enforces; AWS yes, R2 no | [[04 Browser Uploads in Practice]] |
| Exact-key signing | Signing one server-generated key per pending DB row, rather than a whole prefix | [[04 Browser Uploads in Practice]] |
| Time-of-check/time-of-use gap | Bytes replaced after you validated them, possible while a reusable upload URL is still valid | [[04 Browser Uploads in Practice]] |
| Upload key / accepted key | Browser-writable staging (`incoming/…`) vs server-controlled publication of the exact validated snapshot or derivative (`files/…`) | [[04 Browser Uploads in Practice]] |
| CORS | Browser rule letting a page's JavaScript talk to another origin only if that origin allows it; not authorization | [[04 Browser Uploads in Practice]] |
| Preflight | The browser's `OPTIONS` request asking whether a cross-origin request is allowed; sent only when the request needs one | [[04 Browser Uploads in Practice]] |
| Finalize / accept | Your server's "verify the upload, then accept it and mark it ready" step | [[04 Browser Uploads in Practice]] |
| Orphan | A stored object no record accounts for, or a record whose object is missing; handled by states, lifecycle rules and sweeps | [[04 Browser Uploads in Practice]] |
| Idempotent | Safe to repeat; twice has the same effect as once | [[04 Browser Uploads in Practice]] |
| Conditional write | "Only write if…", e.g. `If-None-Match: *` = create only if the key doesn't exist (S3 since 2024) | [[04 Browser Uploads in Practice]] |
| Magic bytes | Leading bytes that identify a file's format; a useful check, not proof | [[04 Browser Uploads in Practice]] |
| Multipart upload | Uploading one object as many independently retryable parts, then completing it | [[04 Browser Uploads in Practice]] |
| Resumable upload / tus | Continuing an interrupted upload from the last confirmed byte; tus is an open protocol for it | [[04 Browser Uploads in Practice]] |
| Lifecycle rule | Bucket rule that expires objects or aborts stale multipart uploads automatically | [[04 Browser Uploads in Practice]] |
| Versioning | Keeping old versions on overwrite or delete (S3); guards against mistakes, costs storage | [[04 Browser Uploads in Practice]] |
| Block Public Access | AWS setting (on by default for new buckets since 2023) that overrides public ACLs and policies | [[02 How S3 Became the Convention]] |
| ACL | Per-object or per-bucket access list; disabled by default on new AWS buckets since 2023 | [[02 How S3 Became the Convention]] |
| S3-compatible | Implements S3's HTTP API so S3 tools work after changing endpoint and credentials; edges vary; no independent certification found | [[02 How S3 Became the Convention]] |
| CDN | Caching servers near users that can serve public files from a private origin; may cut latency and origin load; caches can outlive deletes | [[02 How S3 Became the Convention]], [[03 What Big Tech Does and What a Solo Dev Should Copy]] |
| Origin access control | A CDN feature (e.g. CloudFront OAC) that lets only your CDN read a private bucket | [[02 How S3 Became the Convention]], [[04 Browser Uploads in Practice]] |
| Custom domain | A friendly hostname; adds no caching, authorization or cost savings by itself | [[02 How S3 Became the Convention]] |
| Variant | A derived version of an image (e.g. a 256px thumbnail) | [[05 Photos, Documents and Video]] |
| EXIF | Photo metadata, often including GPS location; configure stripping and verify it worked | [[05 Photos, Documents and Video]] |
| Content-Disposition | Header telling browsers to download (`attachment`) rather than display; reduces exposure, doesn't make content safe | [[05 Photos, Documents and Video]] |
| Container vs codec | MP4 is a container; whether it plays depends on the codecs inside and the file layout | [[05 Photos, Documents and Video]] |
| Transcoding / packaging | Re-encoding video to other formats or qualities / splitting into streamable segments with a manifest | [[05 Photos, Documents and Video]] |
| Adaptive streaming (HLS/DASH) | Video in segments at several qualities plus a manifest; the player switches quality as bandwidth changes | [[05 Photos, Documents and Video]] |
| Ingest server | UploadThing's servers (v7+) that receive browser uploads and write to UploadThing-managed storage | [[06 UploadThing - What It Actually Is]] |
| Callback / webhook | A provider calling your server's endpoint when something happens (e.g. upload complete) | [[06 UploadThing - What It Actually Is]] |
| BYOB | Bring your own bucket: a managed service storing files in storage *you* control; not documented for UploadThing as of 2026-10-18 | [[06 UploadThing - What It Actually Is]] |
| Who operates what | A way to compare dependencies: which parts you run, which a vendor runs, and what you can do when each breaks; more useful than counting companies | [[08 Decision - Own Bucket vs UploadThing]] |
