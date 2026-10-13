# Reuse and prior art

For each new implementation in the diff, search Core and Pro for an existing way to do it. A correct implementation still gets a note if a shared alternative exists.

Known reuse targets:
- events/tracking: `core/common/modules/events-manager` (`server-events-client.php`, `assets/js/module.js`), `event-tracker`
- promotions: `modules/promotions`, `Filtered_Promotions_Manager`
- usage stats: `modules/usage`
- icons: `atomic-widgets/props-resolver/icon-catalog.php`
- dynamic tags: `atomic-widgets/dynamic-tags`
- atomic registries/transformers/schema: `modules/atomic-widgets`
- shared editor code: `packages/packages/{core,libs,tools}`
- test helpers/fixtures: existing PHPUnit/Playwright utils

Method: grep for the concept and for similar names, not only the identical code. Open the candidate before claiming a match.

Output per match: `reimplements <X> -> use <path>` or `correct, but shareable with <path>`.
Reverse: suggest extracting only when a real second consumer exists now or is clearly in the ticket (YAGNI).

Lens name `reuse`. Follow common.md.
