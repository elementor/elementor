Imports one image, or a list of up to 10 images, into the WordPress Media Library by HTTPS URL. Requires a user who can upload files (`upload_files`). Never download or base64-encode the image yourself; the server fetches the file out of band. Requires explicit user consent: the `consent` flag is only a prompt-level hint, and real approval comes from the MCP client asking the user to confirm the tool call. Returns attachment metadata only (no image bytes).

- Only HTTPS URLs on the default port are accepted. The host must be a DNS name or a public IPv4 address; IPv6 literals and IPv6-only hosts are not supported, and the server does not fetch through a proxy. The import ignores proxy settings from the environment and connects directly to the validated address, so for hosts that can only be reached through an outbound proxy use `elementor/request-media-upload` instead.
- Up to 5 redirects are followed, each one re-checked, and the whole download has to finish within 60 seconds.
- The file must be a supported image within the upload size limit. SVG is accepted only for administrators (`manage_options`) on sites that turned on Elementor's unfiltered file uploads.
- When the same URL (without a query string) was imported before, the existing attachment is returned. URLs with a query string are never matched or remembered. `title` and `alt` can be up to 255 characters. Errors for hosts that cannot be used (unresolvable or not public) are intentionally generic.

## One image or a list

- Single image: pass `source_url` (optionally `title` and `alt`). The response is the attachment (`attachment_id`, `url`, `mime`, `width`, `height`, `alt`), and failures are returned as an error, as before.
- Several images: pass `source_urls`, a list of 1 to 10 HTTPS URLs, instead of `source_url` (never both). More than 10 URLs, an empty list, or an entry that is not a non-empty string rejects the whole call. `title` and `alt` are not supported with the list.
- Every URL in the list is checked and imported on its own with all of the rules above, so one failing URL does not stop the others. The whole list has a time limit of 120 seconds; URLs not started before it is reached are reported as `fetch_timeout`.
- The list response is `{ "total", "succeeded", "failed", "uploads": [ ... ] }`. Each entry in `uploads` has `index` (position in the request), `source_url` (as given, without query string or fragment), and `status`: `ok` with the attachment fields, or `error` with `error: { "code", "message" }`.

Example request: `{ "source_urls": ["https://example.com/a.png", "https://example.com/b.jpg"], "consent": true }`

Example response with one failure:

`{ "total": 2, "succeeded": 1, "failed": 1, "uploads": [ { "index": 0, "source_url": "https://example.com/a.png", "status": "ok", "attachment_id": 41, "url": "https://site.test/wp-content/uploads/a.png", "mime": "image/png", "width": 800, "height": 600, "alt": "" }, { "index": 1, "source_url": "https://example.com/b.jpg", "status": "error", "error": { "code": "remote_host_not_allowed", "message": "The source host cannot be used." } } ] }`
