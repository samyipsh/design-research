# Object Storage Hub

Start here. Written for **one reader, you**: a solo developer who wants a coherent working understanding of object storage for web apps (photos, documents, video), so later decisions are informed rather than borrowed.

Research snapshot: **2026-10-18** (Asia/Singapore), with final accuracy review on **2026-10-19**. Prices, versions and metrics retain their individual verification dates. Recheck them before acting on them.

**Most load-bearing sources** (everything else: [[Object Storage Source Ledger]])
- [Amazon S3 launch press release (2006)](https://press.aboutamazon.com/2006/3/amazon-web-services-launches): what S3 set out to be
- [Haystack: Facebook's photo storage (2010, PDF)](https://www.usenix.org/events/osdi10/tech/full_papers/Beaver.pdf): why web files left filesystems
- [AWS: presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html): the mechanism behind direct uploads
- [UploadThing docs: uploading files](https://docs.uploadthing.com/uploading-files) + [v7 launch post (2024)](https://docs.uploadthing.com/blog/v7-launch): what UploadThing documents about itself now
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html): what never to trust

---

## The short answer

- **What object storage is.** A durable key → bytes store spoken over HTTP. Ordinary buckets drop filesystem features (in-place edits, directories, locks) because most web files are written once and read many times. Your database keeps the meaning; the bucket keeps the bytes.
- **The idea that organizes everything.** Separate the **control path** (your server decides and records) from the **data path** (bytes go directly between browser and storage). **Presigned URLs** connect the two. They're reusable, short-lived permissions for one operation, *not* user authentication, content validation or completion signals.
- **Why S3 is the convention.** It was an early pay-as-you-go object store (2006) with a deliberately small HTTP API. AWS kept the API stable while adding what browsers needed: POST forms 2008, multipart 2010, CORS 2012, strong consistency 2020. Many rivals copied the API (my interpretation of the causes). "S3-compatible" means the core usually works and the edges vary. A shared API lowers switching costs, but data movement, provider-only features, credentials, URLs and operations still create dependence.
- **What's actually hard.** Not storing bytes. The glue is: CORS, signing an exact key, knowing an upload finished, the fact that checked bytes can be replaced while a URL is still valid, keeping DB and bucket in sync, validating claims, private reads, deletion, egress cost, and video playback.
- **UploadThing today, as documented.** A managed upload and hosting service with open-source SDKs. Since v7 (Sept 2024), your server signs URLs with your UploadThing key. The browser uploads to *their* ingest servers, files go to UploadThing-managed storage (default AWS us-west-2) served from `ufs.sh`, and they call your server back when an upload completes. Bring-your-own-bucket, self-hosting and bulk export aren't documented (as of 2026-10-18), which isn't proof they're impossible. It solves real glue problems. Authorization, DB records, content checks, deletion policy, video processing and exit planning stay with you.
- **Is it popular?** Public distribution is meaningful and growing: ~820k npm downloads in a recent 30-day window, about 6x two years earlier. In Payload CMS's adapter set, though, its adapter has under 1% of the S3 adapter's downloads. Production adoption at scale, who uses it, and why it grew aren't established by this research either way.
- **My recommendation (for a lasting project whose owner wants to understand the system).** Lean towards **your own S3-compatible bucket, with the storage code in one module you own**: sign, finalize/accept, read, delete, sweep. UploadThing is a defensible production choice when its documented features fit and its unknowns don't matter to you. Coding agents may make either path quicker to build, but they don't operate it.

## Reading route (core, ~3 hours end to end)

Read in order. Each note opens with its sources and ends with takeaways and a link to the next.

1. [[01 What Object Storage Is and Why It Exists]] (~20 min): the mental model, ETags, durability vs availability, what strong consistency does and doesn't cover, cost meters, control vs data path, key vs URL vs DB record.
2. [[02 How S3 Became the Convention]] (~25 min): launch choices, how browser uploads became possible, security defaults, CDN vs custom domain, what "S3-compatible" really means, egress and other lock-in, MinIO, who wants what.
3. [[03 What Big Tech Does and What a Solo Dev Should Copy]] (~12 min): principles worth copying from Facebook, AWS, Dropbox and 37signals, and what to skip.
4. [[04 Browser Uploads in Practice]] (~35 min): proxy vs direct, PUT vs POST, exact-key signing, the reusable-URL problem and the accept step, CORS, finalize, sync and cleanup, validation and abuse, private reads (with the Rails contrast), multipart, deletion, delivery cost.
5. [[05 Photos, Documents and Video]] (~15 min): what changes per file type, including why MP4 playback depends on encoding and when video needs a platform.
6. [[06 UploadThing - What It Actually Is]] (~25 min): history v6 → v7, the signed flow, where files live, documented vs unknown, responsibilities, Theo's pain points checked, dated pricing.
7. [[07 UploadThing Popularity - What the Evidence Shows]] (~12 min): what each kind of popularity evidence can prove, the numbers, and the hypotheses they don't settle.
8. [[08 Decision - Own Bucket vs UploadThing]] (~25 min): the recommendation and its assumptions, when UploadThing wins, reliability as who-operates-what, what agents change, a small starting shape, signals for adding complexity.

### Visual companions (open in a browser; they summarize, so no need to reread)
- [Object storage timeline](object-storage-timeline.html): 1998 → 2026, filterable by research, S3 capabilities, safety, economics, ecosystem and UploadThing. Best after note 02.
- [Upload flows explained](upload-flows-explained.html): step through proxy vs direct-to-your-bucket vs UploadThing v7, with control and data paths marked, plus a "who is responsible for what" table. Best alongside notes 04, 06 and 08.

## Optional reference (outside the core read)
- [[Object Storage Reading List]]: external reading in a sensible order, with effort estimates and what to extract. Opened sources are kept separate from leads.
- [[Object Storage Glossary]]: one-line definitions for quick lookups when rereading.
- [[Object Storage Source Ledger]]: every source consulted, with its date, its type (primary, vendor, secondary) and how I checked it, plus access failures.

## How the notes label things
- A plain statement with a link reports **what that source says**. Vendor docs establish what a vendor documents or advertises, not independent fact. Provider scale and price figures are the provider's own reports. Papers and postmortems describe their own systems.
- `[!note] Interpretation` callouts are **my reading** of causes, motives or implications.
- `[!tip] Recommendation` callouts are **my judgment** for your situation, with assumptions stated.
- `[!warning]` callouts flag **traps or unverified points**.

## Open questions I couldn't settle
- **UploadThing bring-your-own-bucket / self-hosting.** Not in the docs. A 2025 changelog line mentions "self-hosted versions", and third-party articles disagree. Ask UploadThing directly if it matters.
- **UploadThing terms** (retention after cancelling, deletion semantics, fair use on bandwidth). The terms page returned 404, so I haven't reviewed them.
- **UploadThing ingest behavior:** whether it inspects file contents, and whether a signed ingest URL can be reused after a completed upload. Neither is documented.
- **Exact current AWS egress price.** The pricing table didn't render. Check the AWS calculator.
- **Who actually uses UploadThing in production, and why it grew.** The public signals collected here do not establish this; independent case studies or better usage data could.
