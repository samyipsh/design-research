# 02 How S3 Became the Convention

Reading route: **2 of 8** · ~25 min · prev ← [[01 What Object Storage Is and Why It Exists]] · next → [[03 What Big Tech Does and What a Solo Dev Should Copy]] · hub: [[_ Object Storage Hub]]

**Visual companion:** [Object storage timeline (HTML)](object-storage-timeline.html) shows the same story as a filterable chronology. Skim it after reading; there's no need to read both closely.

**Main sources**
- [S3 launch press release (2006)](https://press.aboutamazon.com/2006/3/amazon-web-services-launches) · [Jeff Barr's launch post (2006)](https://aws.amazon.com/blogs/aws/amazon_s3/)
- [S3 CORS support (2012)](https://aws.amazon.com/blogs/aws/amazon-s3-cross-origin-resource-sharing/) · [Vogels on S3 consistency (2021)](https://www.allthingsdistributed.com/2021/04/s3-strong-consistency.html)
- [Cloudflare R2 announcement (2021)](https://blog.cloudflare.com/introducing-r2-object-storage/) · [R2 S3 API compatibility](https://developers.cloudflare.com/r2/api/s3/api/) · [Garage S3 compatibility table](https://garagehq.deuxfleurs.fr/documentation/reference-manual/s3-compatibility/)
- [AWS: S3 turns 20 (2026)](https://aws.amazon.com/blogs/aws/aws-weekly-roundup-amazon-s3-turns-20-amazon-route-53-global-resolver-general-availability-and-more-march-16-2026/) · [MinIO repo (archived 2026)](https://github.com/minio/minio)

> [!summary] The short version
> S3 wasn't the first object store, but it was an early pay-as-you-go one (2006) with a deliberately small HTTP API. AWS kept that API stable while adding what web apps needed: browser uploads, big files, CORS, strong consistency. Tools, SDKs and tutorials piled up around it. Many rivals then chose to **speak S3's API** rather than ask developers to learn a new one, and "S3" became shorthand for object storage. Since then, much of the competition has been about **price, especially egress**. Core API compatibility makes switching easier, but it doesn't make switching free.

Labels used below: dated facts link to sources. Explanations of *why* companies acted are marked **interpretation**.

---

## 1. The launch choices (2006) and why they mattered

On 14 March 2006 Amazon launched S3 as ["storage for the Internet"](https://press.aboutamazon.com/2006/3/amazon-web-services-launches), aimed at developers. The design choices you can verify:

- **A small HTTP API.** Jeff Barr's launch post lists SOAP and REST interfaces, objects up to 5 GB, and per-object access control lists (ACLs: lists of who may read or write each object) ([launch post](https://aws.amazon.com/blogs/aws/amazon_s3/)).
- **Few features, on purpose.** The press release says it was built with a ["minimal feature set"](https://press.aboutamazon.com/2006/3/amazon-web-services-launches) and emphasizes simplicity and robustness.
- **Utility pricing.** $0.15 per GB-month stored and $0.20 per GB transferred, no minimum (same release).
- **Availability over consistency.** The original metadata cache favored availability, so reads could briefly be stale ([Vogels 2021](https://www.allthingsdistributed.com/2021/04/s3-strong-consistency.html)).
- **Dogfooding pitch.** Developers were offered the same storage infrastructure Amazon used for its own sites (press release).

> [!note] Interpretation: why this combination spread
> A tiny HTTP API meant any language could use S3 without a special client. At launch, the published per-GB prices let a solo developer access the service without buying infrastructure. Amazon was turning internal infrastructure into a product, and a small, stable API is easy to sell, document and keep compatible. One concrete sign of that stability: AWS still supports the original `ListObjects` operation alongside its newer `ListObjectsV2` for backward compatibility ([AWS API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html)). Network effects (more tools → more users → more tools) are my explanation for why the API stuck; this research has not quantified them.

## 2. How browser uploads became possible, one constraint at a time

This sequence explains *why* today's upload pattern looks the way it does. Each step removed a reason to push file bytes through your own server.

| When | What changed | Why it mattered for web apps |
|---|---|---|
| 2008 | **Browser POST-form uploads.** An ordinary HTML form carrying a signed policy could upload straight into a bucket ([Simon Willison, 2008](https://simonwillison.net/2008/Jun/27/amazon/)). | Same-origin rules stopped page JavaScript from talking to S3 directly, but a plain form submission could. This is the ancestor of today's presigned POST. |
| Late 2010 | **Multipart upload**, then **5 TB objects**, up from 5 GB ([Vogels, 2010-12-09](https://www.allthingsdistributed.com/2010/12/amazon_s3_5_terabyte_objects.html); press at the time put multipart a month earlier) | Large files (Vogels' example was an HD movie) upload in parallel parts that can be retried individually. |
| 2012-08-31 | **CORS support** ([Jeff Barr](https://aws.amazon.com/blogs/aws/amazon-s3-cross-origin-resource-sharing/)) | JavaScript on your site could talk to S3 directly: drag-and-drop uploads with progress bars, without a proxy server in between. |
| 2020-12 | **Strong read-after-write consistency**, free, for all objects ([AWS](https://aws.amazon.com/about-aws/whats-new/2020/12/amazon-s3-now-delivers-strong-read-after-write-consistency-automatically-for-all-applications)) | "Upload, then immediately check it exists" became reliable on S3. |
| 2024-08-20 | **Conditional writes** (`If-None-Match`) on `PutObject` and `CompleteMultipartUpload` ([AWS](https://aws.amazon.com/about-aws/whats-new/2024/08/amazon-s3-conditional-writes)) | "Create only if the key doesn't exist yet", with no extra coordination. |
| 2025-12-02 | **50 TB max object** ([AWS](https://aws.amazon.com/about-aws/whats-new/2025/12/amazon-s3-maximum-object-size-50-tb/)) | Mostly matters for video and data workloads. |

**CORS**, briefly, since it comes up everywhere: browsers stop a page's JavaScript from reading responses from another origin (scheme + domain + port) unless that origin opts in. Your app lives on `app.example.com` and your bucket somewhere else, so the bucket must send CORS headers that allow your origin. More in [[04 Browser Uploads in Practice]].

## 3. The consistency workaround era (and why it ended)

For about fourteen years, people who needed to read their own writes built extra machinery around S3. Vogels names Netflix's s3mper, which used DynamoDB to detect stale responses, and the Hadoop community's S3Guard. Customers asked AWS to remove the need for that extra infrastructure. AWS added a cache-coherence protocol with a "witness" component, checked with formal methods that Vogels says took more effort than the implementation itself ([Vogels 2021](https://www.allthingsdistributed.com/2021/04/s3-strong-consistency.html)).

> [!note] Interpretation
> This is the platform absorbing complexity its users had been carrying. Once the reference implementation guarantees something, every "S3-compatible" rival gets judged against it. That's another reason to check, rather than assume, what other providers promise.

## 4. Security defaults: from public buckets to private-by-default

Early S3 made it easy to mark objects or buckets public, and over the years many organizations leaked data through misconfigured buckets. AWS responded in two steps:

- **2018-11-15: Block Public Access.** Account- and bucket-level switches that override public ACLs and policies ([AWS](https://aws.amazon.com/about-aws/whats-new/2018/11/introducing-amazon-s3-block-public-access)). Coverage at the time connected it to a run of bucket exposures.
- **April 2023: on by default.** New buckets got Block Public Access enabled and ACLs disabled, however they were created ([AWS](https://aws.amazon.com/about-aws/whats-new/2023/04/amazon-s3-two-security-best-practices-buckets-default)).

What this means for you: **old tutorials that upload with `ACL: 'public-read'` fail on new AWS buckets.** Today's usual setups:
- **Private files**: the bucket stays private, and your app hands out short-lived signed URLs after checking permissions.
- **Public files**: either a **CDN reads from the private bucket** through an origin-access mechanism (on AWS, CloudFront's origin access control lets only your distribution read the bucket; [AWS](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)), or you **deliberately allow public reads** on a prefix, which means relaxing Block Public Access for that bucket.

A **custom domain** is just a friendly name. It doesn't add caching, access control or lower egress unless a CDN or provider feature behind it does that work.

## 5. "S3-compatible": what it does and doesn't mean

**Meaning:** another storage system implements S3's HTTP API (the same request shapes and the same request-signing scheme), so S3 SDKs and tools work after you change the **endpoint URL and credentials**. Tigris calls the API the ["de facto standard"](https://www.tigrisdata.com/blog/s3-compat). Google describes its Cloud Storage XML API as interoperable with *some* S3 tools and libraries ([Google](https://docs.cloud.google.com/storage/docs/interoperability)).

**Not:** identical behavior. AWS publishes an API reference, but I found no independent, cross-provider conformance test or certification, and providers word their compatibility claims carefully ("some tools", "most workloads"). Concrete, documented gaps:

| Provider | Notable gaps vs AWS S3 (as documented) |
|---|---|
| Cloudflare R2 | Presigned URLs only for GET/HEAD/PUT/DELETE, so **no presigned POST**. Presigned URLs work on the S3 API domain, not custom domains ([R2](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)). No versioning, ACLs, object tagging, bucket policies or object lock via the S3 API ([R2 S3 API](https://developers.cloudflare.com/r2/api/s3/api/)). |
| Garage (self-hosted) | Its own permission model instead of S3 ACLs and policies, partial lifecycle support, no versioning. Its 2022 table also shows Swift and Riak CS lacking presigned POST and CORS ([Garage](https://garagehq.deuxfleurs.fr/documentation/reference-manual/s3-compatibility/)). |
| MinIO | Left out of Garage's table because MinIO published no compatibility list. Garage's advice is to run your own tests before relying on any implementation. |

> [!tip] Practical rule
> To keep switching realistic, stay inside the **common core**: put/get/head/delete/list, multipart upload, presigned PUT/GET, CORS and simple lifecycle expiry. Treat presigned POST, versioning, event notifications, object lock and ACLs as provider features you adopt deliberately, and test whatever you depend on.

### Why rivals adopted S3's API

Documented moves:
- **Backblaze B2** added S3-compatible APIs on 2020-05-04, launching with partner tools and pitching an easy switch for existing S3 users ([press release](https://s204.q4cdn.com/590551802/files/doc_news/2020/05/Backblaze-B2-Cloud-Storage-Launches-S3-Compatible-APIs-With-Partners-IBM-Aspera-Veeam-Quantum.pdf), seen via search results).
- **Cloudflare R2** (announced 2021-09-28) paired S3 API compatibility with zero egress fees, arguing that egress charges don't reflect value to customers ([Cloudflare](https://blog.cloudflare.com/introducing-r2-object-storage/)).

> [!note] Interpretation: the incentives
> Implementing S3's API lets a challenger inherit existing SDKs, backup tools and tutorials, and makes switching *to* it cheap. AWS benefits too, since its API remains the reference point. That probably explains why the API has been stable as a convention. But it's my reading, not a measured finding.

## 6. Egress, data movement and the other sources of lock-in

Getting data *into* object storage is cheap. Getting it *out*, to users or to another provider, is billed on many platforms, and that shapes behavior at every scale:

- **R2 (2021)** made zero egress its headline (above).
- **AWS (2024-03-05)** began waiving internet egress for customers moving data out of AWS, after support approval, alongside the standing 100 GB/month free tier ([AWS](https://aws.amazon.com/blogs/aws/free-data-transfer-out-to-internet-when-moving-out-of-aws/)). Coverage linked the timing to the EU Data Act (secondary).
- **37signals** (Basecamp, HEY) reported close to 10 PB in S3 costing around $1.3M a year, on a four-year contract that ran to mid-2025 ([DHH, 2024-10-17](https://world.hey.com/dhh/our-cloud-exit-savings-will-now-top-ten-million-over-five-years-c7d9b5bd)). They moved to their own hardware in 2025, and AWS waived about $250,000 of egress ([The Register, 2025-05-09](https://www.theregister.com/2025/05/09/37signals_cloud_repatriation_storage_savings)). The Register's 18 PB figure doesn't match DHH's ~10 PB; I'd trust DHH's own number for what sat in S3.

> [!note] Interpretation
> A shared API reduces the *code* you'd rewrite to switch providers. Dependence also comes from **moving the data**, provider-only features you adopted, **credentials and permission models**, **URLs** baked into your app or CDN, and operational habits like alerts, lifecycle rules and runbooks. For a solo project, keeping exit realistic mostly means storing keys rather than provider URLs, staying near the common core, and knowing how you'd copy everything out. See [[08 Decision - Own Bucket vs UploadThing]].

## 7. Self-hosting reality check: MinIO

MinIO was the best-known self-hosted S3-compatible server (61.3k GitHub stars). Secondary reports describe it stripping admin features from the community edition in 2025 and putting the community repository into maintenance mode in December 2025 ([InfoQ](https://infoq.com/news/2025/12/minio-s3-api-alternatives/), via search). The primary evidence is the repository itself: archived on **2026-04-25**, with a README that says it is ["no longer maintained"](https://github.com/minio/minio) and points to paid products.

> [!tip] Lesson for a solo dev
> Self-hosted object storage ties you to someone else's open-source business model *and* makes you the operator (disks, durability, upgrades). Managed providers exist so you don't have to be. Self-host only for a specific reason, such as fully offline local development.

## 8. Where S3 stands at 20 (March 2026)

AWS's own anniversary figures: more than 500 trillion objects, more than 200 million requests per second, and a storage price a little over 2 cents per GB, about 85% below launch ([AWS](https://aws.amazon.com/blogs/aws/aws-weekly-roundup-amazon-s3-turns-20-amazon-route-53-global-resolver-general-availability-and-more-march-16-2026/)). These are provider-reported, not independently audited. AWS increasingly builds other products on S3 (its FAQ now covers S3 Tables and S3 Files), which entrenches the API further.

## Who wants what (interpretation)

| Stakeholder | What they want | How it shows up for you |
|---|---|---|
| AWS | Keep S3 as the default; earn on storage, requests, egress | Rich features, stable API, egress fees, private-by-default after the leaks |
| Challengers (R2, B2, Tigris…) | Win switchers cheaply | S3-compatible core + lower or zero egress, with gaps at the edges |
| Open-source servers (MinIO…) | A sustainable business | License or maintenance changes can strand self-hosters |
| Wrapper services (UploadThing, Vercel Blob…) | Own the developer-experience layer | Faster setup; files in storage *they* manage; pricing may bundle egress |
| Very large users (Dropbox, 37signals) | Lower cost per PB | Leave once scale justifies running hardware |
| You (solo dev) | Low cognitive load, no surprise bills, a realistic exit | Standard API, a thin integration, egress awareness |

## Takeaways
- S3 became the convention through an early, simple, pay-per-use HTTP API that stayed stable, and later because rivals chose to copy it (my interpretation of the causes).
- Browser-direct uploads arrived step by step: POST forms (2008), multipart (2010), CORS (2012), strong consistency (2020), conditional writes (2024).
- "S3-compatible" means the core usually works and the edges vary. No independent certification exists that I could find, so test what you rely on.
- A shared API lowers switching costs. Data movement, provider-only features, credentials, URLs and operations still create dependence.
- Public files go through a CDN with origin access, or a deliberately public bucket. A custom domain alone is just a name.

Next: [[03 What Big Tech Does and What a Solo Dev Should Copy]]
