# PHPUnit — CSS Converter (Variables First)

## Prerequisites
- WordPress + Elementor dev environment
- Composer installed
- PHPUnit test env for Elementor

## Install
1) Install parser deps (sabberworm):
```
cd plugins/elementor/modules/css-converter && composer install
```

2) Install WP test env:
```
cd plugins/elementor && composer run test:install
```

## Run tests
- Entire suite:
```
cd plugins/elementor && composer test
```

- Only css-converter tests:
```
cd plugins/elementor && composer test -- --filter Css_Converter
```

## Test locations
- Parser and mapping tests:
`plugins/elementor/tests/phpunit/elementor/modules/css-converter/`

## What we test in MVP
- CssParser variables extraction:
  - :root/html variables are detected with correct values
  - Var names preserved; values preserved
- Mapping (when implemented):
  - Variables normalized (id/label)
  - Upsert behavior (created vs updated)
- Optional REST:
  - POST /elementor/v2/css-converter/variables imports variables and returns summary

Notes:
- Keep test CSS small and explicit. Avoid magic values; use named fixtures if possible.
- If REST route is not implemented yet, skip those tests with @group skip or markTestSkipped.
