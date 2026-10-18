Imports an image into the WordPress Media Library by HTTPS URL. Never download or base64-encode the image yourself; the server fetches the file out of band. Requires explicit user consent: the `consent` flag is only a prompt-level hint, and real approval comes from the MCP client asking the user to confirm the tool call. Returns attachment metadata only (no image bytes).

- Only HTTPS URLs on the default port are accepted. The host must be a DNS name or a public IPv4 address; IPv6 literals and IPv6-only hosts are not supported, and the server does not fetch through a proxy.
- Up to 5 redirects are followed, each one re-checked, and the whole download has to finish within 60 seconds.
- The file must be a supported image within the upload size limit. SVG is accepted only for administrators on sites that turned on Elementor's unfiltered file uploads.
- When the same URL (without a query string) was imported before, the existing attachment is returned. URLs with a query string are never matched or remembered. `title` and `alt` can be up to 255 characters.
