# Object Storage Source Ledger

Optional reference: the evidence behind the notes. Which sources were opened, when they're dated, and how much weight they can bear. Back to [[_ Object Storage Hub]].

All sources checked **2026-10-18** (Asia/Singapore) unless noted.

**How to read the columns**
- **Checked:** *Opened* = I fetched and read the page (or the PDF pages). *Snippet* = seen only in search results, or the page wouldn't render, so treat it as a lead.
- **Type:** *primary* = an organization or person describing its own system, product or decision (vendor docs establish what the vendor documents or advertises). *Vendor* = a company writing about a market it sells into. *Secondary* = press or third-party commentary.

---

## Origins and big-tech systems

| Source | Date | Type | Checked | Used for |
|---|---|---|---|---|
| [NASD (CMU PDL abstract)](https://pdl.cmu.edu/PDL-FTP/NASD/asplos98_abs.shtml) | 1998 (ASPLOS VIII) | primary, research | Opened (abstract) | Direct client transfer + cryptographic interfaces as the root idea behind presigned URLs (my interpretation) |
| [Haystack: Facebook's photo storage (PDF)](https://www.usenix.org/events/osdi10/tech/full_papers/Beaver.pdf) | Oct 2010 | primary, research | Opened (pp. 1–3) | Metadata bottleneck, four stored sizes, CDN long tail, write-once workload, simplicity goal |
| [f4: Facebook's Warm BLOB Storage](https://www.usenix.org/conference/osdi14/technical-sessions/presentation/muralidhar) | Aug 2014 | primary, research | Opened (abstract) | Warm tier; replication factor 3.6 → 2.8/2.1 |
| [Warfield: Building and operating a pretty big storage system called S3](https://www.allthingsdistributed.com/2023/07/building-and-operating-a-pretty-big-storage-system.html) | 2023-07-27 | primary (AWS engineer) | Opened | Drive physics, load spreading, durability reviews, operations culture |
| [AWS 2017 S3 us-east-1 outage summary](https://aws.amazon.com/message/41926/) | event 2017-02-28 | primary | Opened | Availability vs durability; operational dependence |
| [The Register: Dropbox moves data from AWS](https://www.theregister.com/2016/03/14/dropbox_moves_data_from_aws) | 2016-03-14 | secondary | Snippet | Magic Pocket exit (original Dropbox post not retrieved) |
| [DHH: Our cloud-exit savings will now top ten million over five years](https://world.hey.com/dhh/our-cloud-exit-savings-will-now-top-ten-million-over-five-years-c7d9b5bd) | 2024-10-17 | primary | Opened | ~10 PB in S3, ~$1.3M/yr, multi-year contract |
| [The Register: 37signals completing on-prem move](https://www.theregister.com/2025/05/09/37signals_cloud_repatriation_storage_savings) | 2025-05-09 | secondary | Opened | ~$250k egress waived; timeline. Its 18 PB figure differs from DHH's ~10 PB |

## S3 history and turning points

| Source | Date | Type | Checked | Used for |
|---|---|---|---|---|
| [Amazon press release: "Amazon Web Services Launches"](https://press.aboutamazon.com/2006/3/amazon-web-services-launches) | 2006-03-14 | primary | Opened | Positioning, deliberately small feature set, launch pricing, availability target |
| [Jeff Barr: Amazon S3 (launch post)](https://aws.amazon.com/blogs/aws/amazon_s3/) | 2006-03-14 | primary | Opened | SOAP + REST, 5 GB objects, per-object ACLs |
| [Simon Willison: Browser Uploads to S3 using HTML POST Forms](https://simonwillison.net/2008/Jun/27/amazon/) | 2008-06-27 | secondary | Opened | Dates browser POST-form uploads to 2008 |
| [Vogels: 5 TB object support](https://www.allthingsdistributed.com/2010/12/amazon_s3_5_terabyte_objects.html) | 2010-12-09 | primary | Opened | 5 GB → 5 TB; multipart upload |
| [Jeff Barr: S3 Cross Origin Resource Sharing Support](https://aws.amazon.com/blogs/aws/amazon-s3-cross-origin-resource-sharing/) | 2012-08-31 | primary | Opened | Browser JS can upload directly without a proxy |
| [AWS: Introducing S3 Block Public Access](https://aws.amazon.com/about-aws/whats-new/2018/11/introducing-amazon-s3-block-public-access) | 2018-11-15 | primary | Snippet | Response to bucket exposures |
| [AWS: Two security best practices on all new buckets](https://aws.amazon.com/about-aws/whats-new/2023/04/amazon-s3-two-security-best-practices-buckets-default) | 2023-04 (announced 2022-12) | primary | Snippet | Block Public Access on, ACLs off by default |
| [AWS: Strong read-after-write consistency](https://aws.amazon.com/about-aws/whats-new/2020/12/amazon-s3-now-delivers-strong-read-after-write-consistency-automatically-for-all-applications) | 2020-12-01 | primary | Snippet | Consistency turning point |
| [Vogels: Diving Deep on S3 Consistency](https://www.allthingsdistributed.com/2021/04/s3-strong-consistency.html) | 2021-04-20 | primary | Opened | Why eventual consistency in 2006; workarounds; how it was fixed |
| [Backblaze B2 S3-compatible APIs press release (PDF)](https://s204.q4cdn.com/590551802/files/doc_news/2020/05/Backblaze-B2-Cloud-Storage-Launches-S3-Compatible-APIs-With-Partners-IBM-Aspera-Veeam-Quantum.pdf) | 2020-05-04 | vendor | Snippet | Rivals adopting the S3 API |
| [Cloudflare: Announcing R2](https://blog.cloudflare.com/introducing-r2-object-storage/) | 2021-09-28 | vendor | Opened | Zero-egress pitch with S3 API compatibility |
| [AWS: Free data transfer out when moving out of AWS](https://aws.amazon.com/blogs/aws/free-data-transfer-out-to-internet-when-moving-out-of-aws/) | 2024-03-05 | primary | Snippet | Exit egress waiver; 100 GB/month free tier |
| [Simon Willison on the empty-bucket bill](https://simonwillison.net/2024/Apr/30/how-an-empty-s3-bucket-can-make-your-aws-bill-explode) | 2024-04-30 | secondary | Opened | Billing for unauthorized requests |
| [AWS: S3 no longer charges for several HTTP error codes](https://aws.amazon.com/about-aws/whats-new/2024/08/amazon-s3-no-charges-several-http-error-codes) | 2024-08-19 (announced 2024-05-13) | primary | Opened | 403s from outside your account/org are free |
| [AWS: Conditional writes](https://aws.amazon.com/about-aws/whats-new/2024/08/amazon-s3-conditional-writes) | 2024-08-20 | primary | Snippet | `If-None-Match` on PutObject / CompleteMultipartUpload |
| [AWS: GuardDuty Malware Protection for S3](https://aws.amazon.com/about-aws/whats-new/2024/06/detect-malware-object-uploads-amazon-s3-guardduty) | 2024-06-11 | primary | Snippet | Managed scanning of new uploads |
| [AWS: 50 TB max object size](https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-s3-maximum-object-size-50-tb/) | 2025-12-02 | primary | Snippet | 5 TB → 50 TB |
| [AWS Weekly Roundup: S3 turns 20](https://aws.amazon.com/blogs/aws/aws-weekly-roundup-amazon-s3-turns-20-amazon-route-53-global-resolver-general-availability-and-more-march-16-2026/) | 2026-03-16 | primary (provider-reported figures) | Opened | Object count, request rate, ~2¢/GB, ~85% cheaper than launch |
| [The Register: AWS S3 turns 20](https://theregister.com/2026/03/16/aws_s3_turns_20/) | 2026-03-16 | secondary | Snippet | Backward-compatibility claim (secondary) |

## S3 API details (targeted checks during revision)

| Source | Date | Type | Checked | Used for |
|---|---|---|---|---|
| [AWS API: CopyObject](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CopyObject.html) | checked 2026-10-19 | primary docs | Opened (Codex final QA) | Pin source version or condition copying on its ETag; avoid checking one snapshot and publishing another |
| [AWS API: Object (ETag)](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Object.html) | current | primary docs | Opened | ETag isn't reliably an MD5 (multipart, SSE-C/KMS) |
| [AWS API: ListObjectsV2](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html) | current | primary docs | Opened | GET with query parameters; up to 1,000 keys per page; legacy ListObjects still supported |
| [AWS: Appending to objects in directory buckets](https://docs.aws.amazon.com/AmazonS3/latest/userguide/directory-buckets-objects-append.html) | current | primary docs | Opened | Append exists only for S3 Express One Zone directory buckets (footnote scope) |
| [Boto3: generate_presigned_post](https://docs.aws.amazon.com/boto3/latest/reference/services/s3/client/generate_presigned_post.html) | current | primary docs | Opened (first consulted by Codex QA) | POST returns url + fields; fields vs conditions; `content-length-range` |
| [AWS: POST Policy (API reference)](https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-HTTPPOSTConstructPolicy.html) | current | primary docs | Snippet (page wouldn't render for me or for Codex) | Original reference for POST policy conditions |
| [CloudFront: Restrict access to an S3 origin (OAC)](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html) | current | primary docs | Opened | CDN reading a private bucket via origin access control |

## "S3-compatible"

| Source | Date | Type | Checked | Used for |
|---|---|---|---|---|
| [Cloudflare R2: S3 API compatibility](https://developers.cloudflare.com/r2/api/s3/api/) | current | vendor docs | Opened | Implemented and missing operations; conditional PutObject |
| [Cloudflare R2: Presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/) | current | vendor docs | Opened | GET/HEAD/PUT/DELETE only; no POST; not on custom domains; 7-day max |
| [Garage: S3 compatibility status](https://garagehq.deuxfleurs.fr/documentation/reference-manual/s3-compatibility/) | 2022-02-07, updated 2022-05-25 | project docs | Opened | Cross-implementation gaps; advice to test yourself |
| [Google Cloud Storage: Interoperability](https://docs.cloud.google.com/storage/docs/interoperability) | current | vendor docs | Opened | Interoperable with some S3 tools |
| [Tigris: The Storage API That Ate The World](https://www.tigrisdata.com/blog/s3-compat) | 2025-04-08 | vendor | Opened | "De facto standard" framing; no published conformance suite |
| [MinIO GitHub repository](https://github.com/minio/minio) | archived 2026-04-25 | primary | Opened | No-longer-maintained notice; 61.3k stars |
| [InfoQ: MinIO maintenance mode](https://infoq.com/news/2025/12/minio-s3-api-alternatives/) | 2025-12 | secondary | Snippet | Maintenance-mode timeline |

## Upload mechanics and safety

| Source | Date | Type | Checked | Used for |
|---|---|---|---|---|
| [AWS: Download and upload objects with presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html) | current | primary docs | Opened | Bearer and reusable until expiry; credential-bound expiry; checksum headers with SigV4 |
| [AWS: Uploading objects with presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html) | current | primary docs | Opened | PUT flow; overwrite on existing key; content-type must match |
| [Fly.io community: content-length-range doesn't limit file upload](https://community.fly.io/t/content-length-range-doesnt-limit-file-upload/25260) | 2025-07-01 | community | Opened | Policy conditions apply to POST, not PUT |
| [AWS: Using CORS](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html) | current | primary docs | Opened | Rule matching; bucket permissions still apply |
| [AWS: Multipart upload limits](https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html) | current | primary docs | Opened | 48.8 TiB max, 10,000 parts, 5 MiB–5 GiB parts, ~100 MB guidance |
| [AWS: Lifecycle rule for incomplete multipart uploads](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpu-abort-incomplete-mpu-lifecycle-config.html) | current | primary docs | Opened | Recommended cleanup rule |
| [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) | current | community standard | Opened | Content-Type not trusted; magic bytes not alone; rename; separate host; image rewriting; scanning |
| [Rails Guides: Active Storage Overview](https://guides.rubyonrails.org/active_storage_overview.html) (incl. [authenticated controllers](https://guides.rubyonrails.org/active_storage_overview.html#authenticated-controllers)) | current | primary docs (framework) | Opened | Direct uploads; purging unattached uploads; private service + short redirects; public default controllers with non-expiring signed IDs; unsafe user transforms |
| [tus resumable upload protocol 1.0](https://tus.io/protocols/resumable-upload) | 2016-03-25 | spec | Opened | Offset query + resume mechanism |
| [Vercel Functions Limits](https://vercel.com/docs/functions/limitations) | last updated 2026-08-24 | vendor docs | Opened | 4.5 MB request body limit |
| [MDN: Setting up adaptive streaming media sources](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Audio_and_video_delivery/Setting_up_adaptive_streaming_media_sources) | current | reference | Opened | Renditions, segments, manifests |
| [Cloudflare Stream: Direct creator uploads](https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/) | current | vendor docs | Opened | Video platforms take uploads directly; tus above 200 MB |
| [Mux: Insights from Theo Browne](https://mux.com/blog/theobrowne) | 2024-11-26 | vendor interview | Opened | Theo's S3 pain points; buckets aren't video platforms |
| [Cloudflare R2 pricing](https://developers.cloudflare.com/r2/pricing/) | last updated 2026-10-01 | vendor docs | Opened | $0.015/GB-month; free egress; free tier |
| [AWS S3 pricing](https://aws.amazon.com/s3/pricing/) | current | primary | Opened (table didn't render) | Only the 100 GB/month free egress line |

## UploadThing

| Source | Date | Type | Checked | Used for |
|---|---|---|---|---|
| [Docs: intro](https://docs.uploadthing.com) | current | primary | Opened | Positioning |
| [Docs: Uploading files](https://docs.uploadthing.com/uploading-files) | current | primary | Opened | Signing scheme, ingest host, registration, callbacks, resumable |
| [Docs: Auth & security](https://docs.uploadthing.com/concepts/auth-security) | current | primary | Opened | Middleware auth; callback HMAC; public endpoint |
| [Docs: Regions and ACL](https://docs.uploadthing.com/concepts/regions-acl) | current | primary | Opened | Default AWS us-west-2; region change doesn't move files; paid features |
| [Docs: Working with files](https://docs.uploadthing.com/working-with-files) | current | primary | Opened | `ufs.sh` URLs; storage location may change; signed URLs |
| [Docs: UTApi](https://docs.uploadthing.com/api-reference/ut-api) | current | primary | Opened | deleteFiles, listFiles (admin use), signed URLs; keep file data in your DB |
| [Docs: File routes](https://docs.uploadthing.com/file-routes) | current | primary | Opened | Default size limits; ACL; awaitServerData |
| [Docs: FAQ](https://docs.uploadthing.com/faq) | current | primary | Opened | Callback reachability (local, Vercel previews) |
| [Docs: v6 → v7 migration](https://docs.uploadthing.com/v7) | current | primary | Opened | Presigning on your server; single token |
| [Docs sitemap](https://docs.uploadthing.com/sitemap-0.xml) | checked 2026-10-18 | primary | Opened | 42 URLs; no BYOB, export, self-hosting or transcoding page |
| [Blog: UploadThing is 5x Faster (v7)](https://docs.uploadthing.com/blog/v7-launch) | 2024-09-13 | primary | Opened | v6 vs v7 architecture; BYOB and transcoding as future work |
| [Blog: Our First Major Outage](https://docs.uploadthing.com/blog/incident-report-2024-09-10) | 2024-09-11 | primary | Opened | Shared → regional S3 buckets; 53-minute URL outage |
| [Blog: Usage-based pricing](https://docs.uploadthing.com/blog/usage-based) | 2025-01-30 | primary | Opened | Advertised no seat/request/bandwidth charges; PicThing, T3 Chat |
| [v6 docs](https://v6.docs.uploadthing.com/) | archived docs | primary | Opened | v6-era self-description as an S3 wrapper |
| [Pricing](https://uploadthing.com/pricing) | checked 2026-10-18 (no effective date) | primary | Opened | Plans and overage |
| [Homepage](https://uploadthing.com) | checked 2026-10-18 | primary | Opened | No customer logos or counts; Theo testimonial as CEO |
| [GitHub repo](https://github.com/pingdotgg/uploadthing) + [API](https://api.github.com/repos/pingdotgg/uploadthing) | checked 2026-10-18 | primary | Opened | 5,351 stars; MIT SDKs; created 2023-05-10; last push 2026-09-30 |
| [CHANGELOG](https://github.com/pingdotgg/uploadthing/blob/main/packages/uploadthing/CHANGELOG.md) | through 7.7.4 | primary | Opened | Ingest (7.0.0); dynamic regions (7.7.0); self-hosted mention (7.7.3) |
| [Issue #28: S3 API compatibility](https://github.com/pingdotgg/uploadthing/issues/28) | 2023-05-11 | primary | Opened | BYO S3 request closed "not planned" |
| [SDK source: shared/src/utils.ts](https://raw.githubusercontent.com/pingdotgg/uploadthing/main/packages/shared/src/utils.ts) | main branch, checked 2026-10-18 | primary | Opened | `matchFileType`: browser MIME, filename fallback, no byte inspection |
| [npm registry: uploadthing](https://registry.npmjs.org/uploadthing) | checked 2026-10-18 | primary | Opened | 7.0.0 on 2024-09-13; 7.7.0 on 2025-05-09; 7.7.4 on 2025-08-17 (latest) |

## Popularity data (window 2026-09-17 → 2026-10-16 unless stated)

| Source | Value | Note |
|---|---|---|
| [npm: uploadthing](https://api.npmjs.org/downloads/point/2026-09-17:2026-10-16/uploadthing) | 820,548 | |
| [npm: uploadthing, 2025 window](https://api.npmjs.org/downloads/point/2025-09-17:2025-10-16/uploadthing) | 319,913 | |
| [npm: uploadthing, 2024 window](https://api.npmjs.org/downloads/point/2024-09-17:2024-10-16/uploadthing) | 137,203 | |
| [npm: @uploadthing/react](https://api.npmjs.org/downloads/point/2026-09-17:2026-10-16/@uploadthing/react) | 611,957 | |
| [npm: @aws-sdk/client-s3](https://api.npmjs.org/downloads/point/2026-09-17:2026-10-16/@aws-sdk/client-s3) | 201,744,504 | Used far beyond uploads; not like-for-like |
| [npm: @aws-sdk/s3-request-presigner](https://api.npmjs.org/downloads/point/2026-09-17:2026-10-16/@aws-sdk/s3-request-presigner) | 97,995,052 | Same caveat |
| [npm: @vercel/blob](https://api.npmjs.org/downloads/point/2026-09-17:2026-10-16/@vercel/blob) | 33,552,806 | Drivers of this count not investigated |
| [Payload CMS storage adapters](https://payloadcms.com/docs/upload/storage-adapters) | S3, R2, Vercel Blob, UploadThing, Azure, GCS | Official adapters in one ecosystem |
| npm: [@payloadcms/storage-s3](https://api.npmjs.org/downloads/point/2026-09-17:2026-10-16/@payloadcms/storage-s3) / [-vercel-blob](https://api.npmjs.org/downloads/point/2026-09-17:2026-10-16/@payloadcms/storage-vercel-blob) / [-r2](https://api.npmjs.org/downloads/point/2026-09-17:2026-10-16/@payloadcms/storage-r2) / [-uploadthing](https://api.npmjs.org/downloads/point/2026-09-17:2026-10-16/@payloadcms/storage-uploadthing) | 1,470,019 / 572,938 / 183,103 / 9,470 | Relative download volume only, not preference or market share |
| [ecosyste.ms: uploadthing](https://packages.ecosyste.ms/api/v1/registries/npmjs.org/packages/uploadthing) | 208 dependent repos indexed | Partial index coverage |
| [HN Algolia search](https://hn.algolia.com/api/v1/search?query=uploadthing&tags=story) | Homepage submissions: 1 point (2023-05-01), 2 points (2025-05-20) | Fuzzy search; most hits unrelated |
| [fal-ai video-starter-kit package.json](https://raw.githubusercontent.com/fal-ai-community/video-starter-kit/main/package.json) | depends on `uploadthing` ^7.4.4 | Show HN 268 points (2025-01-23) |
| [create-t3-app intro](https://create.t3.gg/en/introduction) | No UploadThing mention | Theo's own starter |
| [Upstash: File uploads in a React app (2026)](https://upstash.com/blog/file-uploads-in-a-react-app-what-to-use-and-pricing-breakdown-2026.md) | 2026-09-23 | Competitor-written comparison |
| [Garret Harp: Uploads Are Easy](https://garretcharp.com/posts/uploads-are-easy/) | 2023-05-06 | Independent counterpoint (proxies via a Worker) |

The npm values were first recorded from the `last-month` endpoint, whose window on 2026-10-18 was exactly 2026-09-17 → 2026-10-16. The fixed-window URL for `uploadthing` was rechecked and returns the same value.

## Access failures and unresolved leads
- `uploadthing.com/tos` returned 404, so **UploadThing's terms weren't reviewed** (retention, fair use, deletion semantics unknown).
- `docs.uploadthing.com/llms.txt`: 404.
- GitHub's dependents page for uploadthing: unavailable.
- next-forge's UploadThing migration page: 404 after redirect (lead only). supastarter's UploadThing docs: lead only.
- advancedweb.hu (PUT vs POST article): DNS failure.
- CACM "A Second Conversation with Werner Vogels": 403.
- AWS POST Policy API page and the S3 pricing table didn't render.
- Original Dropbox 2016 post and Maciej Pocwierz's Medium post: not retrieved (coverage used instead).
- Theo's specific "S3 is hard" video: not located (homepage, v6 docs and the Mux interview used instead).
- Third-party claims that UploadThing supports your own bucket conflict with its docs. Not verified.
