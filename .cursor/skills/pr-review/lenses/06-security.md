# Security

- Output escaping: `esc_*`/`wp_kses_post` in PHP, Twig attribute quoting (an unquoted `id=` with `html_attr` is injectable), React `dangerouslySetInnerHTML`, markdown/label injection for AI/export consumers.
- Unquoted attribute values (`id=`, `class=`, any `attr={{ x }}`) are a blocker when the value is user-controlled: encoders like `html_attr`/`esc_attr` do not guarantee a space cannot start a new attribute (e.g. `onfocus=`). Require the value to be wrapped in quotes. Precedent in sibling elements is not evidence of safety; check whether the sibling quotes it, and verify the encoder's behavior rather than assuming.
- Input: sanitize/validate on every REST, ajax, MCP, import/export, form path; no raw `$_GET/$_POST`.
- AuthZ: `current_user_can` and nonces/permission callbacks on every endpoint and MCP tool; no privilege escalation via settings or import.
- SSRF, path traversal, file upload types, unsafe deserialization, secrets/keys in client code (note when expected, e.g. restricted Embed API keys).
- Stored XSS via user-controlled settings (CSS ID, custom attributes, custom CSS, SVG).
- Leave license-bypass semantics to `core-pro`; note `-> core-pro`.

Lens name `security`. Follow common.md.
