# CSS Converter Module — Overview

This module provides CSS parsing and (MVP) conversion of CSS variables into Elementor Global Variables.

## Status
- MVP scope focuses on variables-first conversion.
- Future phases (out of scope): Global Classes, Widget styling, Widget creation.

## Key Files
- `parsers/css-parser.php` — Sabberworm-powered parser returning structured `ParsedCss`.
- `docs/PLAN.md` — Variables-first plan.
- `docs/PHPUNIT.md` — Running PHPUnit tests.
- `docs/MANUAL-TESTING.md` — Manual verification steps.

## Setup
```
cd plugins/elementor/modules/css-converter && composer install
```

## Tests
See `docs/PHPUNIT.md`.

## Manual Testing
See `docs/MANUAL-TESTING.md`.


