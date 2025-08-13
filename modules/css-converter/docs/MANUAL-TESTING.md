# Manual Testing — Variables First MVP

This guide validates that CSS variables can be parsed and (optionally) imported as Global Variables.

## A) Verify parser extraction
1) Ensure dependencies:
```
cd plugins/elementor/modules/css-converter && composer install
```

2) In WP-CLI:
```
wp eval 'require_once ABSPATH . "wp-content/plugins/elementor/modules/css-converter/parsers/css-parser.php"; $p=new \\Elementor\\Modules\\CssConverter\\Parsers\\CssParser(); $css=":root{--primary:#007cba;--spacing-md:16px;}"; $parsed=$p->parse($css); print_r($p->extract_variables($parsed));'
```

Expected: array of variables with name/value/scope.

## B) (If route enabled) Import variables via REST
1) Enable the css-converter route for variables (see PLAN.md); ensure auth is not hardcoded.
2) POST payload:
```
{
  "css": ":root { --primary: #007cba; --spacing-md: 16px; }"
}
```
3) Verify response summary lists created/updated variables.

## C) Validate in editor (optional)
- Open Elementor editor and confirm that the new Global Variables are available (e.g., color/token pickers) if rendering/UI is wired.
- If not yet wired, inspect the active Kit meta to confirm persisted values.

Troubleshooting:
- If autoloader error: run composer install in the css-converter module directory.
- If REST 401: check nonce/capabilities; remove any legacy hardcoded API keys.
