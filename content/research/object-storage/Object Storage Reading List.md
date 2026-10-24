# Object Storage Reading List

Optional reference: the original sources behind the notes, ordered so each one builds on the last. You **don't** need these to follow the notes. They're for going deeper or checking claims. Back to [[_ Object Storage Hub]].

As of 2026-10-18. Verification status for every item is in [[Object Storage Source Ledger]].

**Legend:** ✅ opened and read · 🔎 lead only (search result, press coverage, or the page wouldn't render) · ⏱ rough reading time

---

## Path A: Understand the field (~2.5 hours)

| # | Read | ⏱ | Why, and what to extract | Pairs with |
|---|---|---|---|---|
| 1 | ✅ [Amazon S3 launch press release (2006-03-14)](https://press.aboutamazon.com/2006/3/amazon-web-services-launches) | 5 min | The original design requirements and how little was promised. Compare with what S3 became. | [[02 How S3 Became the Convention]] |
| 2 | ✅ [Haystack paper, sections 1–2 (PDF)](https://www.usenix.org/events/osdi10/tech/full_papers/Beaver.pdf) | 25 min | Figure 1 (browser → web server → CDN → storage) is the web's file-serving shape. Extract why per-file metadata became the bottleneck, and the CDN long-tail lesson. | [[01 What Object Storage Is and Why It Exists]], [[03 What Big Tech Does and What a Solo Dev Should Copy]] |
| 3 | ✅ [AWS: Download and upload objects with presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html) | 15 min | Bearer semantics, reuse until expiry, why URLs expire early with temporary credentials, checksum support, the troubleshooting FAQ. | [[04 Browser Uploads in Practice]] |
| 4 | ✅ [Jeff Barr: S3 CORS support (2012)](https://aws.amazon.com/blogs/aws/amazon-s3-cross-origin-resource-sharing/) | 5 min | The moment browser-direct uploads stopped needing a proxy. | [[02 How S3 Became the Convention]] |
| 5 | ✅ [Vogels: Diving Deep on S3 Consistency (2021)](https://www.allthingsdistributed.com/2021/04/s3-strong-consistency.html) | 20 min | What eventual consistency cost users, and how a platform absorbs complexity. Skim the formal-methods part. | [[01 What Object Storage Is and Why It Exists]], [[02 How S3 Became the Convention]] |
| 6 | ✅ [Warfield: Building and operating a pretty big storage system called S3 (2023)](https://www.allthingsdistributed.com/2023/07/building-and-operating-a-pretty-big-storage-system.html) | 30 min | Drive physics, load spreading, durability reviews, ownership culture: why "let the provider operate it" makes sense. | [[03 What Big Tech Does and What a Solo Dev Should Copy]] |
| 7 | ✅ [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) | 20 min | Which checks are claims and which inspect content; renaming; separate hosts; image rewriting; scanning. | [[04 Browser Uploads in Practice]], [[05 Photos, Documents and Video]] |
| 8 | ✅ [Rails Guides: Active Storage Overview](https://guides.rubyonrails.org/active_storage_overview.html): direct uploads, purging unattached uploads, and especially [authenticated controllers](https://guides.rubyonrails.org/active_storage_overview.html#authenticated-controllers) | 20 min | A mature framework's defaults, including the useful surprise that a private storage service still sits behind public app routes by default. | [[04 Browser Uploads in Practice]] |
| 9 | ✅ [MDN: Setting up adaptive streaming media sources](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Audio_and_video_delivery/Setting_up_adaptive_streaming_media_sources) | 15 min | What adaptive video needs (renditions, segments, manifest) and why a bucket alone doesn't produce it. | [[05 Photos, Documents and Video]] |

## Path B: UploadThing specifically (~1 hour)

| # | Read | ⏱ | Why, and what to extract |
|---|---|---|---|
| 10 | ✅ [UploadThing v7 launch post (2024-09-13)](https://docs.uploadthing.com/blog/v7-launch) | 10 min | The v6 vs v7 diagrams are the clearest evidence it's no longer S3 presigned URLs plus callbacks. Note what's listed as future work. |
| 11 | ✅ [Docs: Uploading files](https://docs.uploadthing.com/uploading-files) | 15 min | The signing scheme, ingest URL, registration and callback verification. Read it as "what would I build myself?" |
| 12 | ✅ [Docs: Regions and ACL](https://docs.uploadthing.com/concepts/regions-acl) + [Working with files](https://docs.uploadthing.com/working-with-files) | 10 min | Where files live, what region changes do and don't do, URL formats, signed URLs. |
| 13 | ✅ [Incident report: Our First Major Outage (2024-09-11)](https://docs.uploadthing.com/blog/incident-report-2024-09-10) | 10 min | An honest postmortem showing the moving parts (KV cache, buckets, CDN domain) between users and files. |
| 14 | ✅ [Mux: Insights from Theo Browne (2024-11-26)](https://mux.com/blog/theobrowne) | 10 min | Theo's own list of S3 pain points, and his view that buckets aren't video platforms. Vendor-published, so read critically. |
| 15 | ✅ [Garret Harp: Uploads Are Easy (2023)](https://garretcharp.com/posts/uploads-are-easy/) | 5 min | The counterpoint. Notice what it leaves out (validation, DB records, cleanup): that's where the real work lives. |

## Path C: Deeper or reference

- ✅ [NASD abstract (CMU, 1998)](https://pdl.cmu.edu/PDL-FTP/NASD/asplos98_abs.shtml) (5 min): the research root of direct transfer plus cryptographic authorization.
- ✅ [f4: Facebook's Warm BLOB Storage (2014)](https://www.usenix.org/conference/osdi14/technical-sessions/presentation/muralidhar) (abstract 5 min): storage temperature tiers.
- ✅ [AWS 2017 S3 outage summary](https://aws.amazon.com/message/41926/) (10 min): how one command took down a region, and the fixes.
- ✅ [Cloudflare R2 announcement (2021)](https://blog.cloudflare.com/introducing-r2-object-storage/) (10 min): the zero-egress pitch in its own words.
- ✅ [R2 S3 API compatibility](https://developers.cloudflare.com/r2/api/s3/api/) + [R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/) (15 min): what "S3-compatible" leaves out, concretely.
- ✅ [Garage S3 compatibility status](https://garagehq.deuxfleurs.fr/documentation/reference-manual/s3-compatibility/) (10 min): a cross-implementation table (dated 2022).
- ✅ [Boto3: generate_presigned_post](https://docs.aws.amazon.com/boto3/latest/reference/services/s3/client/generate_presigned_post.html) (10 min): POST policy fields vs conditions, including size ranges.
- ✅ [CloudFront: restrict access to an S3 origin](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html) (skim 10 min): how a CDN serves from a private bucket.
- ✅ [AWS API: Object (ETag)](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Object.html) (5 min): why ETags aren't checksums.
- ✅ [DHH: Our cloud-exit savings… (2024)](https://world.hey.com/dhh/our-cloud-exit-savings-will-now-top-ten-million-over-five-years-c7d9b5bd) (10 min): S3 economics at ~10 PB.
- ✅ [AWS: multipart limits](https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html) and [abort-incomplete-multipart lifecycle rule](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpu-abort-incomplete-mpu-lifecycle-config.html) (10 min): reference for big files.
- ✅ [tus protocol 1.0](https://tus.io/protocols/resumable-upload) (15 min): resumable uploads at the HTTP level.

## Leads (read with care)
- 🔎 [The Register: Dropbox moves data from AWS (2016)](https://www.theregister.com/2016/03/14/dropbox_moves_data_from_aws). The original Dropbox Magic Pocket post wasn't retrieved.
- 🔎 [InfoQ: MinIO maintenance mode (Dec 2025)](https://infoq.com/news/2025/12/minio-s3-api-alternatives/). The archived [MinIO repo](https://github.com/minio/minio) (✅) is the primary evidence.
- 🔎 [AWS: POST Policy API page](https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-HTTPPOSTConstructPolicy.html). Didn't render; use the Boto3 reference above.
- 🔎 "A Second Conversation with Werner Vogels" (CACM, 2021): 403. The advancedweb.hu PUT vs POST article: DNS failure.
- 🔎 Theo's specific "S3 is hard" video: not located. Use #14 instead.
