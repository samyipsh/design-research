# 07 UploadThing Popularity: What the Evidence Shows

Reading route: **7 of 8** · ~12 min · prev ← [[06 UploadThing - What It Actually Is]] · next → [[08 Decision - Own Bucket vs UploadThing]] · hub: [[_ Object Storage Hub]]

**Main sources** (all checked 2026-10-18; full list in [[Object Storage Source Ledger]])
- [npm downloads API (fixed window)](https://api.npmjs.org/downloads/point/2026-09-17:2026-10-16/uploadthing) · [GitHub API](https://api.github.com/repos/pingdotgg/uploadthing) · [ecosyste.ms](https://packages.ecosyste.ms/api/v1/registries/npmjs.org/packages/uploadthing)
- [Payload CMS storage adapters](https://payloadcms.com/docs/upload/storage-adapters) · [HN Algolia search](https://hn.algolia.com/api/v1/search?query=uploadthing&tags=story) · [UploadThing homepage](https://uploadthing.com)

> [!summary] Verdict, kept within the evidence
> **Observed:** meaningful and growing public distribution. ~820k npm downloads in 2026-09-17 → 2026-10-16, about 6x the same window in 2024. There are 5,351 GitHub stars and an official Payload CMS adapter. Within Payload's own adapter set, the UploadThing adapter's downloads are **under 1%** of the S3 adapter's.
> **Not established by this research:** how many active projects or production deployments use UploadThing, who those users are, or *why* it grew. My searches found no independent, named production case studies, but limited searches can't prove there are none. The homepage shows no customer logos or usage numbers.
> **So:** "popular" is a reasonable word for its package distribution and visibility. Broad production adoption and scale remain unproven either way. Engineering fit matters more than resolving that label ([[08 Decision - Own Bucket vs UploadThing]]).

---

## What each kind of evidence can and can't tell you

| Evidence | What it shows | What it can't show |
|---|---|---|
| Marketing claims | What the company wants you to believe | Anything independent |
| GitHub stars | Interest and awareness (one click) | Use, let alone production use |
| npm downloads | Install activity, including CI runs, rebuilds, bots, templates and scaffolding | Number of projects or people; production use |
| Dependent repos | Public code that imports it | Private or production apps; index coverage is partial |
| Template or ecosystem inclusion | Someone thought it worth offering | That users pick it |
| Named production users | Real adoption, ideally with scale | Typical experience, unless several are independent |
| Community discussion (HN, forums) | Some visibility; critiques | Representative usage or who the users are |

## The data (snapshot 2026-10-18)

**npm, `uploadthing` package, the same 30-day window each year:**

| Window | Downloads |
|---|---|
| 2024-09-17 → 2024-10-16 | [137,203](https://api.npmjs.org/downloads/point/2024-09-17:2024-10-16/uploadthing) |
| 2025-09-17 → 2025-10-16 | [319,913](https://api.npmjs.org/downloads/point/2025-09-17:2025-10-16/uploadthing) |
| 2026-09-17 → 2026-10-16 | [820,548](https://api.npmjs.org/downloads/point/2026-09-17:2026-10-16/uploadthing) |

`@uploadthing/react` in the latest window: [611,957](https://api.npmjs.org/downloads/point/2026-09-17:2026-10-16/@uploadthing/react).

**Context, same window, not like-for-like:** `@aws-sdk/client-s3` [201.7M](https://api.npmjs.org/downloads/point/2026-09-17:2026-10-16/@aws-sdk/client-s3), `@aws-sdk/s3-request-presigner` [98.0M](https://api.npmjs.org/downloads/point/2026-09-17:2026-10-16/@aws-sdk/s3-request-presigner), `@vercel/blob` [33.6M](https://api.npmjs.org/downloads/point/2026-09-17:2026-10-16/@vercel/blob). The AWS packages are used for much more than browser uploads, and I didn't investigate what drives the `@vercel/blob` count. These only show orders of magnitude.

**Within one ecosystem: Payload CMS.** Payload offers official storage adapters for S3, R2, Vercel Blob, UploadThing, Azure and GCS ([Payload docs](https://payloadcms.com/docs/upload/storage-adapters)). Downloads in the same window:

| Adapter | Downloads | Relative to the S3 adapter |
|---|---|---|
| [`@payloadcms/storage-s3`](https://api.npmjs.org/downloads/point/2026-09-17:2026-10-16/@payloadcms/storage-s3) | 1,470,019 | 100% |
| [`@payloadcms/storage-vercel-blob`](https://api.npmjs.org/downloads/point/2026-09-17:2026-10-16/@payloadcms/storage-vercel-blob) | 572,938 | ~39% |
| [`@payloadcms/storage-r2`](https://api.npmjs.org/downloads/point/2026-09-17:2026-10-16/@payloadcms/storage-r2) | 183,103 | ~12% |
| [`@payloadcms/storage-uploadthing`](https://api.npmjs.org/downloads/point/2026-09-17:2026-10-16/@payloadcms/storage-uploadthing) | 9,470 | ~0.6% |

What this shows: relative **download volume** of these packages in that window. It isn't a controlled measure of developer preference, production adoption or market share. Package age, template defaults, CI and caching behavior, transitive installs, and installs per project can all move the counts. The S3 adapter also serves other S3-compatible providers.

**GitHub** ([API](https://api.github.com/repos/pingdotgg/uploadthing)): 5,351 stars, 448 forks, created 2023-05-10, last push 2026-09-30, 51 open issues. GitHub's dependents page was unavailable when I tried. ecosyste.ms indexes **208 dependent repositories**, with partial coverage ([ecosyste.ms](https://packages.ecosyste.ms/api/v1/registries/npmjs.org/packages/uploadthing)).

**Named users I could verify:**
- Ping's own apps, **PicThing and T3 Chat**, mentioned in UploadThing's own pricing post ([blog](https://docs.uploadthing.com/blog/usage-based)). Self-reported.
- **fal.ai's open-source video starter kit** depends on `uploadthing` ([package.json](https://raw.githubusercontent.com/fal-ai-community/video-starter-kit/main/package.json)), and its Show HN received 268 points on 2025-01-23 ([HN Algolia](https://hn.algolia.com/api/v1/search?query=uploadthing&tags=story)). A starter template, not a production deployment.
- **Payload CMS** maintains an official adapter (above). That's ecosystem support, not usage.

**Homepage claims** ([uploadthing.com](https://uploadthing.com)): no developer, app or file counts, and no customer logos. The single testimonial is Theo's own (["I asked for a better S3 for years"](https://uploadthing.com)), labelled with his CEO role.

**Hacker News:** two submissions of the homepage got 1 point (2023-05-01) and 2 points (2025-05-20) ([HN Algolia](https://hn.algolia.com/api/v1/search?query=uploadthing&tags=story)). That's a small observation about one forum. It doesn't tell you the product's reach or audience.

**Starter inclusion:** the create-t3-app introduction (Theo's own stack) doesn't mention UploadThing ([create.t3.gg](https://create.t3.gg/en/introduction)). Search results suggested next-forge and supastarter have UploadThing guides, but the next-forge page returned 404 for me, so those remain leads.

**Independent critiques:** most comparisons I found were written by competitors (e.g. [Upstash, 2026-09-23](https://upstash.com/blog/file-uploads-in-a-react-app-what-to-use-and-pricing-breakdown-2026.md), which recommends its own product). An early independent counterpoint, Garret Harp's 2023 post, argues that ["S3 is already super easy to use"](https://garretcharp.com/posts/uploads-are-easy/). His example proxies files through a Cloudflare Worker and leaves out validation, DB records and cleanup. That illustrates the real disagreement: storing bytes *is* easy, and the whole upload lifecycle is where the work lies ([[04 Browser Uploads in Practice]]).

## Incentives, and the hypotheses they suggest

> [!note] Interpretation (hypotheses, not findings)
> Theo is both a developer YouTuber with a large audience and the CEO of the company selling UploadThing. That doesn't make his technical claims wrong; the pain points are real ([[06 UploadThing - What It Actually Is]] §5). But from public data alone, growth driven by product fit and growth driven by distribution look much the same. Plausible hypotheses: that adoption is concentrated among his audience and Next.js tutorial readers, and that his reach drives much of the growth. **Neither is established here.** Testing them would take user surveys, attributed signups, or named case studies.

## What would change my assessment
- Named, independent companies describing production use, with scale.
- UploadThing publishing dated usage numbers (apps, files, bytes).
- Ecosystem data that controls for templates and transitive installs.

## Takeaways
- Observed: download growth of about 2.3–2.6x a year (2024 → 2025 → 2026), stars, and an official CMS adapter.
- Not established: production adoption at scale, user demographics, or causes. Absence in my searches isn't evidence of absence.
- In the one ecosystem comparison, UploadThing's adapter has a small share of downloads. That's a download fact, not a preference measurement.
- Decide on fit, control and exit, not on the popularity label: [[08 Decision - Own Bucket vs UploadThing]].

Next: [[08 Decision - Own Bucket vs UploadThing]]
