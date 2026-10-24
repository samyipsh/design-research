# 03 What Big Tech Does and What a Solo Dev Should Copy

Reading route: **3 of 8** · ~12 min · prev ← [[02 How S3 Became the Convention]] · next → [[04 Browser Uploads in Practice]] · hub: [[_ Object Storage Hub]]

**Main sources**
- [Haystack (Facebook, OSDI 2010, PDF)](https://www.usenix.org/events/osdi10/tech/full_papers/Beaver.pdf) · [f4 (Facebook, OSDI 2014)](https://www.usenix.org/conference/osdi14/technical-sessions/presentation/muralidhar)
- [Warfield: Building and operating a pretty big storage system called S3 (2023)](https://www.allthingsdistributed.com/2023/07/building-and-operating-a-pretty-big-storage-system.html)
- [AWS 2017 S3 outage summary](https://aws.amazon.com/message/41926/) · [DHH on leaving S3 (2024)](https://world.hey.com/dhh/our-cloud-exit-savings-will-now-top-ten-million-over-five-years-c7d9b5bd)

> [!summary] The point of this note
> Big companies make storage decisions under pressures you don't have: cost per petabyte, tail latency across billions of requests, and whole operations teams. Their *principles* transfer well. Their *architectures* mostly don't. Copy the principles and skip the machinery.

---

## Principles worth copying

### 1. Metadata in a database, bytes in a blob store
Haystack existed because per-photo filesystem metadata cost disk seeks. Facebook's answer was to keep per-photo metadata tiny and in memory and treat photos as blobs, while most other user data lived in MySQL ([Haystack §1, §2.3](https://www.usenix.org/events/osdi10/tech/full_papers/Beaver.pdf)).

**Copy:** your Postgres or SQLite holds who owns what, the status and the original filenames. The bucket holds bytes under opaque keys. (That's the key vs URL vs DB record idea from [[01 What Object Storage Is and Why It Exists]].)

### 2. Make the sizes you'll serve
For every uploaded photo, Facebook generated and stored four sizes ([Haystack §1](https://www.usenix.org/events/osdi10/tech/full_papers/Beaver.pdf)).

**Copy:** don't send a 4000-pixel original into a 48-pixel avatar slot. Generate a couple of fixed sizes after upload, or use an image optimizer restricted to an allowlist of sizes. See [[05 Photos, Documents and Video]].

### 3. A cache layer for hot files; storage still serves the long tail
Facebook used CDNs for popular images, but found that requests for older, rarely viewed photos (the long tail) mostly missed the CDN and hit storage anyway. Caching everything wasn't cost-effective ([Haystack §2.2](https://www.usenix.org/events/osdi10/tech/full_papers/Beaver.pdf)).

**Copy:** when latency or delivery cost matters for *public* media, put a real CDN in front, meaning one that caches and reads from your bucket through an origin-access mechanism. A custom domain on its own is only a name: it adds no caching and doesn't by itself change what you pay. Whether a CDN actually saves money depends on your traffic pattern and on how the provider prices CDN vs storage egress. Caches also mean deleted or re-permissioned files can linger until they expire or you invalidate them.

### 4. Temperature tiers, but only when the bill justifies it
f4 introduced a "warm" tier for rarely accessed blobs, cutting the effective replication factor from 3.6 to 2.8 or 2.1 ([f4](https://www.usenix.org/conference/osdi14/technical-sessions/presentation/muralidhar)). At Facebook's scale that saves enormous amounts of hardware.

**Copy much later, if ever:** cheaper storage classes and lifecycle transitions exist on most providers. For a small app the savings are usually smaller than the time it takes to reason about retrieval fees and minimum-storage-duration rules.

### 5. Operations is the actual product
Andy Warfield describes S3 as a continuously running service rather than shipped software, built from millions of hard drives. A single disk still manages only about 120 random operations per second, so S3 spreads each customer's data widely to balance load. It also runs "durability reviews" and uses lightweight formal verification ([Warfield, 2023](https://www.allthingsdistributed.com/2023/07/building-and-operating-a-pretty-big-storage-system.html)). Even so, one mistyped command caused the [2017 outage](https://aws.amazon.com/message/41926/).

**Copy:** let a provider do this work. Your job is a **thin, boring integration you fully understand**.

### 6. Simplicity is a design goal at scale too
Haystack's authors listed simplicity as one of four goals and credit it with letting them ship in months rather than years ([Haystack §1](https://www.usenix.org/events/osdi10/tech/full_papers/Beaver.pdf)). S3 also launched with deliberately few features ([[02 How S3 Became the Convention]]).

**Copy:** a small storage module you understand beats a flexible abstraction you don't need yet.

## Build vs buy is a function of scale

Two companies left S3 for their own hardware, both at scales far beyond a solo app:
- **Dropbox** (2016) moved most of its storage onto its own system, Magic Pocket, after being an early S3 user. Press reports put the share at about 90% ([The Register](https://www.theregister.com/2016/03/14/dropbox_moves_data_from_aws), secondary; I didn't retrieve Dropbox's original post).
- **37signals** (2025) left roughly 10 PB of S3 that cost around $1.3M a year ([DHH](https://world.hey.com/dhh/our-cloud-exit-savings-will-now-top-ten-million-over-five-years-c7d9b5bd)).

> [!note] Interpretation (an assessment, not a measurement)
> At petabyte scale, owned hardware plus staff can beat cloud prices. For a solo developer storing gigabytes to a few terabytes, with no existing data center or ops time to spare, I can't see self-run storage paying for the hours it takes. That judgment would change if you already run hardware, have unusual compliance needs, or value the learning itself. Either way, the transferable lesson is **keep leaving possible**: standard API, keys in your DB, no hard-coded provider URLs.

## What a solo dev should usually *avoid* (because the big-tech context doesn't apply)

| Tempting | Why big companies do it | Why you probably shouldn't (yet) |
|---|---|---|
| Building or self-hosting an object store | Cost per PB; control | You become the durability team. MinIO's community repository was archived in 2026 ([[02 How S3 Became the Convention]]). |
| Multi-region replication from day one | Latency and regulatory needs across continents | You'd pay for extra copies, replication traffic and requests, and take on failover and consistency questions. Most apps are fine in one region with the provider's durability. |
| Event pipelines (bucket events → queues → workers) for every upload | Huge asynchronous processing volumes | A finalize call from the browser is usually enough to start. But browsers close and calls fail, so you still need a sweep that reconciles abandoned uploads ([[04 Browser Uploads in Practice]] §6–7). |
| Storage-class tiering and lifecycle juggling | Savings across exabytes | Small savings, real pitfalls (retrieval fees, minimum durations, slow restores). |
| A generic multi-provider storage framework | Leverage in vendor negotiations | A few app-specific storage functions behind one module give most of the practical portability with far less code. Changing providers can still mean adapting upload flows and config, not just swapping a class. |
| Running your own CDN or media pipeline | Unique scale | Use a provider's CDN or a media service when you actually need one. |

## Takeaways
- Copy: **DB for meaning, blobs for bytes · serve resized variants · a real CDN for hot public files when it pays off · let the provider operate · keep it simple.**
- Skip: custom storage, multi-region, event pipelines and tiering until a concrete signal appears. Keep the cleanup duty that event pipelines would otherwise handle.
- Big companies leaving S3 is a story about scale, not a warning for small apps. Just keep your exit door unlocked.

Next: [[04 Browser Uploads in Practice]]
