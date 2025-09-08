# CSS Converter Module — Overview

This module provides CSS parsing and (MVP) conversion of CSS variables into Elementor Global Variables.

## Status
- MVP scope focuses on variables-first conversion.
- Future phases (out of scope): Global Classes, Widget styling, Widget creation.

## Key Files
- `parsers/css-parser.php` — Sabberworm-powered parser returning structured `ParsedCss`.
- `docs/PLAN.md` — Variables-first plan.

## Setup
```
cd plugins/elementor/modules/css-converter && composer install
```

## Postman Usage (Local Dev)

- Endpoint URL: `http://elementor.local/wp-json/elementor/v2/css-converter/variables`
- Method: `POST`
- Headers:
  - `Content-Type: application/json`
  - Optional dev token: `X-DEV-TOKEN: <your-token>`
    - Define in `wp-config.php`: `define( 'ELEMENTOR_CSS_CONVERTER_DEV_TOKEN', '<your-token>' );`
- Body (raw JSON):
  - CSS string:
    `{ "css": ":root { --primary: #eee; --spacing: 16px; }" }`
  - Remote URL:
    `{ "url": "http://elementor.local/wp-content/uploads/test.css" }`

Response includes:
- `variables`: converted editor variables (hex colors only in MVP)
- `rawVariables`: extracted variables
- `stats`: `converted`, `extracted`, `skipped`
- `logs`: absolute paths to the saved CSS and variables list in `modules/css-converter/logs/`. This is only for debug, until we integrate this with Editor Variables.


