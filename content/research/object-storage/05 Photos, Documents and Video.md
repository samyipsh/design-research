# 05 Photos, Documents and Video

Reading route: **5 of 8** · ~15 min · prev ← [[04 Browser Uploads in Practice]] · next → [[06 UploadThing - What It Actually Is]] · hub: [[_ Object Storage Hub]]

**Main sources**
- [Haystack (Facebook, 2010, PDF)](https://www.usenix.org/events/osdi10/tech/full_papers/Beaver.pdf) · [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) · [Rails Active Storage guide](https://guides.rubyonrails.org/active_storage_overview.html)
- [MDN: adaptive streaming](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Audio_and_video_delivery/Setting_up_adaptive_streaming_media_sources) · [Cloudflare Stream: direct creator uploads](https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/) · [Mux interview with Theo Browne (2024)](https://mux.com/blog/theobrowne)

> [!summary] The point
> Object storage treats every file the same: bytes under a key. Your *users* don't. Photos need resizing and privacy scrubbing. Documents need careful serving because they can carry harmful content. Video often needs **processing before it plays well everywhere**. A bucket alone does none of this, so decide per file type what happens *after* the upload.

---

## At a glance

| | Photos | Documents (PDF, Office…) | Video |
|---|---|---|---|
| Typical size | KBs to tens of MB | KBs to tens of MB | tens of MB to many GB |
| Main risk | Leaking location metadata; huge originals slowing pages | Malicious or active content; sensitive data | Failed uploads; formats that won't play; storage and delivery cost |
| After upload | Re-encode (and verify metadata is gone); make a few sizes | Keep private; maybe preview; maybe scan | Check it's playable; maybe transcode or package for streaming |
| Delivery | CDN for public variants | Authorized short-lived URL; download, not inline | Progressive file for simple cases; adaptive streaming when the product needs it |
| Does a bucket cover it? | Storage yes, resizing no | Storage yes, safety no | Storage yes, playback preparation no |

## Photos

- **Variants.** Facebook stored four sizes of every uploaded photo ([Haystack](https://www.usenix.org/events/osdi10/tech/full_papers/Beaver.pdf)). For you: generate a couple of fixed sizes when accepting the upload ([[04 Browser Uploads in Practice]] §4), or use an image optimizer limited to known widths. UploadThing's docs show Next.js's image optimizer pinned to its file host via `remotePatterns` ([docs](https://docs.uploadthing.com/working-with-files)).
- **Don't let users choose transformation parameters.** Rails' guide calls arbitrary user-supplied variant parameters unsafe ([Rails guide](https://guides.rubyonrails.org/active_storage_overview.html)). Unlimited sizes let anyone burn your CPU and fill your cache.
- **Strip metadata, and check that it's actually gone.** Phone photos carry EXIF metadata, often including GPS location. OWASP recommends rewriting images (decode, then re-encode) to drop metadata and some malicious payloads, and notes that rewriting doesn't remove everything ([OWASP](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)). Some image libraries copy metadata through by default, so configure stripping explicitly and test with a geotagged photo. For a social or marketplace app, removing location is a privacy duty (my judgment).
- **Public vs private:** avatars and product images are usually public (served through a CDN). Photos in private albums go through authorized, signed reads.

## Documents

- **Private by default.** Invoices, IDs and contracts go through your app's authorization check plus a short-lived signed URL ([[04 Browser Uploads in Practice]] §10).
- **Limit where and how they render.** Serve user files from a separate, unrelated domain rather than your app's origin or a subdomain that shares its cookies. OWASP prefers a separate host. Then set `Content-Disposition: attachment; filename="…"` so browsers download rather than render inline. These steps keep an uploaded HTML or SVG file from running script in your app's context. They do **not** make a malicious PDF or Office file safe for the person who opens it.
- **Previews** (a page-one thumbnail) need extra tooling. Rails can preview PDFs and videos using external tools ([Rails guide](https://guides.rubyonrails.org/active_storage_overview.html)). Don't build this until users need it.
- **Scanning:** if users share documents with *other* users, consider malware scanning (e.g. GuardDuty for S3; [AWS 2024](https://aws.amazon.com/about-aws/whats-new/2024/06/detect-malware-object-uploads-amazon-s3-guardduty)) or content disarm and reconstruction for Office/PDF files. OWASP mentions both. If files only go back to their uploader, the risk is much lower.

## Video (the one that surprises people)

### Uploading is a big-file problem
Videos are large, so uploads fail partway through. Plan for multipart or resumable uploads early if video matters ([[04 Browser Uploads in Practice]] §11). Theo makes the same point about large video files and flaky connections ([Mux interview](https://mux.com/blog/theobrowne)).

### Playback depends on the encoding, not the file extension
**MP4 is a container.** Whether a browser can play the file depends on the codecs inside and how the file is laid out. A phone's MP4 usually plays, but some codecs and layouts don't work in every browser. "It's an .mp4" doesn't guarantee playback.

For simple cases, **progressive playback** works: put a compatible MP4 in a bucket, point a `<video>` tag at it, and the browser fetches it with HTTP range requests, which lets viewers seek and stop early without downloading everything. Every viewer gets the same single quality, though. That may be too heavy for a phone on a weak connection and too low for a big screen.

**Adaptive streaming** is the fix *when the product needs it*. The player switches quality as bandwidth changes. That requires the video to be prepared ahead of time: MDN describes splitting the media into chunks at several quality levels, plus a manifest (`.m3u8` for HLS, `.mpd` for DASH) ([MDN](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Audio_and_video_delivery/Setting_up_adaptive_streaming_media_sources)). Serving those chunks needs nothing special; a bucket behind a CDN works. **Producing** them means transcoding (re-encoding to several qualities), or at least packaging/segmenting when the source is already suitably encoded. That's done with tools like ffmpeg, a cloud transcoding service, or a video platform.

Even UploadThing's CEO says a bucket isn't a video platform: ["just streaming a file from S3 sucks"](https://mux.com/blog/theobrowne). He points to a video service after upload. (Context: this is a Mux-published interview, and Theo was building an UploadThing–Mux integration at the time.) UploadThing's 2024 v7 post listed transcoding as *future* work ([blog](https://docs.uploadthing.com/blog/v7-launch)), and as of 2026-10-18 its docs sitemap has no transcoding page ([sitemap](https://docs.uploadthing.com/sitemap-0.xml)). That's what's documented, not proof the service never processes video.

### Three honest options

| Your situation | Do this |
|---|---|
| Video is incidental (short clips, a few per user) | Store MP4s with size and duration limits, check at acceptance that they're in a broadly playable format, and serve them progressively through a CDN. Revisit if playback complaints appear. |
| Video is core to the product | Upload **directly to a video platform** (Mux, Cloudflare Stream and similar accept direct browser uploads). Cloudflare Stream issues one-time upload URLs and requires tus above 200 MB ([docs](https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/)). Store only the platform's asset ID in your DB. |
| You need full control or unusual formats | Build a pipeline: upload to your bucket, a background job transcodes or packages it, renditions go back to the bucket, and a CDN serves them. Real work; don't start here. |

> [!tip] Recommendation
> If video is central to your product, treat "video platform" as a separate decision from "object storage". Don't stretch your bucket (or UploadThing) into a video pipeline.

## Takeaways
- Same storage, different post-upload work: **photos → resize + verified metadata stripping · documents → private, download-only, maybe scanned · video → check playability, then progressive or adaptive delivery depending on the product.**
- A bucket stores video fine. Smooth playback across devices needs encoding and, for adaptive streaming, packaging, usually via a video platform.
- A separate origin and download-only headers reduce exposure. They don't make a malicious file harmless.

Next: [[06 UploadThing - What It Actually Is]]
