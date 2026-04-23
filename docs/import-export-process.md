# Elementor Import / Export Process

This document explains how the Elementor kit export, import, and revert system works, covering architecture, data flow, key files, and extension points.

---

## Table of Contents

- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [Architecture: The Runner Pattern](#architecture-the-runner-pattern)
- [Export Flow](#export-flow)
- [Import Flow](#import-flow)
- [Chunked (Split) Import](#chunked-split-import)
- [Revert Flow](#revert-flow)
- [Customization System](#customization-system)
- [Extending the System (Global Classes Example)](#extending-the-system-global-classes-example)
- [Key Classes Reference](#key-classes-reference)

---

## Overview

Elementor's import/export system allows users to **export** an entire site as a `.zip` kit file (containing templates, content, site settings, plugins list, taxonomies, etc.) and **import** that kit onto another site. It also supports **reverting** the last import.

There are two parallel module trees:

| Module | Path | Role |
|--------|------|------|
| **Legacy** | `app/modules/import-export/` | Original AJAX-based import/export (being phased out) |
| **Customization** | `app/modules/import-export-customization/` | Current REST-API-based system with granular customization support |

Both share the same runner pattern and process architecture. This document focuses on the **customization** variant, which is the active system.

---

## Directory Structure

### `app/modules/import-export-customization/`

```
import-export-customization/
├── module.php                          # Module bootstrap, public API, admin UI
├── utils.php                           # JSON helpers, ID mapping, CPT utilities
├── usage.php                           # Tracker hook for usage analytics
├── wp-cli.php                          # `wp elementor kit` CLI commands
│
├── processes/
│   ├── export.php                      # Export orchestrator (ZIP creation + runner loop)
│   ├── import.php                      # Import orchestrator (ZIP extraction + runner loop + session management)
│   └── revert.php                      # Revert orchestrator (undo last import)
│
├── runners/
│   ├── runner-interface.php            # Shared interface: get_name() + meta key constants
│   ├── export/
│   │   ├── export-runner-base.php      # Abstract base: should_export() + export()
│   │   ├── site-settings.php
│   │   ├── plugins.php
│   │   ├── templates.php
│   │   ├── taxonomies.php
│   │   ├── elementor-content.php
│   │   └── wp-content.php
│   ├── import/
│   │   ├── import-runner-base.php      # Abstract base: should_import() + import() + session meta helpers
│   │   ├── site-settings.php
│   │   ├── plugins.php
│   │   ├── templates.php
│   │   ├── taxonomies.php
│   │   ├── elementor-content.php
│   │   ├── wp-content.php
│   │   └── floating-elements.php
│   └── revert/
│       ├── revert-runner-base.php      # Abstract base: should_revert() + revert()
│       ├── site-settings.php
│       ├── plugins.php                 # No-op (plugins are never auto-reverted)
│       ├── templates.php
│       ├── taxonomies.php
│       ├── elementor-content.php
│       └── wp-content.php
│
├── compatibility/
│   ├── base-adapter.php                # Adapter interface for manifest/settings normalization
│   ├── customization.php               # Adapts pre-3.0 manifest format to current
│   ├── envato.php                      # Envato kit source adapter
│   └── kit-library.php                 # Kit Library source adapter
│
├── data/
│   ├── controller.php                  # REST namespace: elementor/v1/import-export-customization
│   ├── response.php
│   └── routes/
│       ├── base-route.php
│       ├── export.php
│       ├── import.php
│       ├── import-runner.php
│       ├── upload.php
│       ├── revert.php
│       ├── manager-url.php
│       ├── process-media.php
│       └── traits/handles-quota-errors.php
│
└── assets/js/                          # React App UI for the export/import wizard
```

### `modules/global-classes/import-export-customization/`

```
import-export-customization/
├── import-export-customization.php     # Hook registration (adds runners to export/import)
└── runners/
    ├── export.php                      # Global Classes export runner
    └── import.php                      # Global Classes import runner (merge or override)
```

---

## Architecture: The Runner Pattern

The system is built around a **pluggable runner pattern**. Each process (Export, Import, Revert) maintains an ordered list of runners. Each runner is responsible for one "slice" of the kit (e.g., site settings, templates, content).

### Runner Interface

All runners implement `Runner_Interface`, which requires a static `get_name(): string` method returning a unique identifier.

### Runner Base Classes

| Base Class | Key Methods |
|------------|-------------|
| `Export_Runner_Base` | `should_export(array $data): bool`, `export(array $data): array{files, manifest}` |
| `Import_Runner_Base` | `should_import(array $data): bool`, `import(array $data, array $imported_data): array`, `get_import_session_metadata(): array` |
| `Revert_Runner_Base` | `should_revert(array $data): bool`, `revert(array $data)` |

### Default Runner Registration Order

The order matters — later runners depend on data produced by earlier ones (e.g., taxonomy ID maps are needed by content importers).

| # | Export | Import | Revert |
|---|--------|--------|--------|
| 1 | Site_Settings | Site_Settings | Site_Settings |
| 2 | Plugins | Plugins | Plugins *(no-op)* |
| 3 | Templates | Templates | Templates |
| 4 | Taxonomies | Taxonomies | Taxonomies |
| 5 | Elementor_Content | Elementor_Content | Elementor_Content |
| 6 | Wp_Content | Wp_Content | Wp_Content |
| 7 | — | Floating_Elements | — |

Third-party runners (like Global Classes) are registered via WordPress action hooks and appended after the defaults.

---

## Export Flow

**Entry point:** `Module::export_kit(array $settings)`

```
User clicks "Export"
       │
       ▼
Module::export_kit($settings)
       │
       ▼
new Processes\Export($settings)
       │
       ▼
register_default_runners()
       │
       ▼
do_action('elementor/import-export-customization/export-kit', $export)
  └── 3rd-party runners register here (e.g. Global Classes)
       │
       ▼
Export::run()
  ├── set_default_settings()
  ├── init_zip_archive()         → creates ZipArchive in temp dir
  ├── init_manifest_data()       → base manifest: name, title, version, author, site URL
  ├── optional: start Media Collector (for cloud media format)
  │
  ├── FOR EACH runner:
  │   ├── runner->should_export($data) ?
  │   └── runner->export($data)
  │       └── returns { files: [...], manifest: [...] }
  │           ├── files → added to ZIP (JSON or raw)
  │           └── manifest → merged into manifest_data
  │
  ├── write manifest.json to ZIP
  └── close ZIP
       │
       ▼
Returns { manifest, file_name, media_urls }
```

### What Each Export Runner Produces

| Runner | Files in ZIP | Manifest Keys |
|--------|-------------|---------------|
| **Site_Settings** | `site-settings.json` | `site-settings` (boolean flags for theme, classes, variables, experiments) |
| **Plugins** | *(none)* | `plugins` (list with name, path, version) |
| **Templates** | `templates/{id}.json` per template | `templates` (metadata per template) |
| **Taxonomies** | `taxonomies/{taxonomy}.json` per taxonomy | `taxonomies` |
| **Elementor_Content** | `content/{post_type}/{id}.json` per post | `content` |
| **Wp_Content** | `wp-content/{post_type}/{post_type}.xml` (WXR) | `wp-content` |
| **Global Classes** *(3rd-party)* | `global-classes.json` | *(none)* |

---

## Import Flow

**Entry point:** `Module::import_kit(string $path, array $settings)`

```
User uploads ZIP or selects from library
       │
       ▼
Module::upload_kit($file, $referrer)
  ├── new Import($file, $settings)
  │   ├── extract_zip()
  │   ├── read manifest.json
  │   ├── init compatibility adapters
  │   └── read site-settings.json (adapted)
  └── Returns { session, manifest, conflicts }
       │
       ▼
User reviews manifest, selects what to import
       │
       ▼
Module::import_kit($session_id, $settings)
       │
       ▼
new Import($session_id, $settings)
       │
       ▼
register_default_runners()
       │
       ▼
do_action('elementor/import-export-customization/import-kit', $import)
       │
       ▼
Import::run()
  ├── init_import_session()      → saves session to `elementor_import_sessions` option
  ├── prevent_saving_elements_on_post_creation (filter)
  │     └── Buffers document elements for deferred save with ID replacements
  │
  ├── FOR EACH runner:
  │   ├── runner->should_import($data) ?
  │   └── runner->import($data, $imported_data)
  │       └── returns runner-specific imported data
  │           └── merged into $imported_data via array_merge_recursive
  │   └── collect runner import session metadata (for revert)
  │
  ├── finalize_import_session_option()
  │     └── Stores runner metadata, removes serialized instance_data
  ├── save_elements_of_imported_posts()
  │     └── Replaces old post/term IDs with new ones in dynamic content
  │     └── Saves all buffered document elements
  └── cleanup extracted temp files
       │
       ▼
Returns $imported_data
```

### Key Import Concepts

- **Deferred element save:** During import, document elements are intercepted by `prevent_saving_elements_on_post_creation` and stored in `$documents_data`. After all runners complete, `save_elements_of_imported_posts()` replaces old IDs with new ones (using maps from `Utils::map_old_new_post_ids` and `Utils::map_old_new_term_ids`) and saves everything in one pass.
- **Compatibility adapters:** Before runners execute, `Customization`, `Envato`, and `Kit_Library` adapters normalize the manifest and site settings from older or external formats to the current `3.0` format.
- **Session tracking:** Every import is tracked in the `elementor_import_sessions` WordPress option, keyed by session ID (the temp folder name). Each imported post/term gets `_elementor_import_session_id` meta for later revert.

---

## Chunked (Split) Import

For large kits, the import can be split into per-runner AJAX/REST calls to avoid timeouts.

```
import_kit($path, $settings, split_to_chunks: true)
  ├── registers runners
  ├── init_import_session(save_instance_data: true)
  │     └── Serializes the entire Import instance (runners, adapters, settings, etc.)
  │         into the elementor_import_sessions option
  └── Returns { session, runners[] }
       │
       ▼
Client calls import_kit_by_runner(session_id, runner_name) for each runner
  ├── Import::from_session(session_id)
  │     └── Reconstructs Import instance from serialized option data
  ├── run_runner(runner_name)
  │     └── Runs a single runner
  │     └── Updates instance_data in option after each runner
  ├── If LAST runner:
  │     └── finalize + save_elements + cleanup
  └── Returns { status, runner, imported_data }
```

---

## Revert Flow

**Entry point:** `Module::revert_last_imported_kit()`

```
User clicks "Remove Website Template"
       │
       ▼
new Revert()
  └── Loads import_sessions and revert_sessions from options
       │
       ▼
register_default_runners()
       │
       ▼
do_action('elementor/import-export-customization/revert-kit', $revert)
       │
       ▼
Revert::run()
  ├── get_last_import_session()
  │
  ├── FOR EACH runner:
  │   ├── runner->should_revert($import_session) ?
  │   └── runner->revert($import_session)
  │         └── Uses stored runner metadata + _elementor_import_session_id meta
  │             to delete/restore the specific content from that import
  │
  ├── revert_attachments()
  │     └── Deletes all attachments tagged with the session ID
  │
  └── delete_last_import_data()
        ├── Pops last session from elementor_import_sessions
        └── Logs it to elementor_revert_sessions
```

### What Each Revert Runner Does

| Runner | Action |
|--------|--------|
| **Site_Settings** | Calls `kits_manager->revert()`, rolls back theme/experiments |
| **Plugins** | No-op (`should_revert` returns `false`) |
| **Templates** | Deletes templates by session meta |
| **Taxonomies** | Deletes terms by session meta |
| **Elementor_Content** | Deletes Elementor posts by session meta, restores `page_on_front` |
| **Wp_Content** | Deletes non-Elementor posts by session meta, cleans up nav menus |

---

## Customization System

The `customization` array in the request payload controls **what** gets exported/imported at a granular level.

### Customization Payload Structure

```php
$customization = [
    'settings' => [
        'colors'      => true/false,
        'typography'  => true/false,
        'theme'       => true/false,
        'classes'     => true/false,     // Global Classes toggle
        'variables'   => true/false,     // CSS Variables toggle
        'classesOverrideAll' => true/false,
    ],
    'templates' => [
        'themeBuilder' => [
            'overrideConditions' => [...],
        ],
    ],
    'content' => [
        'mediaFormat'     => 'link' | 'cloud',
        'customPostTypes' => [...],
    ],
    'plugins' => null,  // or specific plugin selection
];
```

Runners check the relevant `$data['customization']` keys in their `should_export` / `should_import` / `export` / `import` methods to decide behavior.

### WordPress Filters for Customization

Runners expose filters that allow further customization:

- `elementor/import-export-customization/elementor-content/post-types/customization`
- `elementor/import-export-customization/.../export/.../query-args/customization`
- `elementor/import-export-customization/.../import/.../query-args/customization`

---

## Extending the System (Global Classes Example)

The Global Classes module at `modules/global-classes/import-export-customization/` demonstrates how to extend the import/export system.

### 1. Register Hooks

`import-export-customization.php` listens to the export/import action hooks and registers custom runners:

```php
class Import_Export_Customization {
    const FILE_NAME = 'global-classes';

    public function register_hooks() {
        add_action('elementor/import-export-customization/export-kit', function (Export $export) {
            $export->register(new Export_Runner());
        });

        add_action('elementor/import-export-customization/import-kit', function (Import $import) {
            $import->register(new Import_Runner());
        });
    }
}
```

### 2. Export Runner

`runners/export.php` extends `Export_Runner_Base`:

- **`should_export`**: checks that `settings` is in `$data['include']`, the `classes` customization flag is enabled, and both Global Classes + Atomic Widgets experiments are active.
- **`export`**: loads classes via `Global_Classes_Repository`, validates with `Global_Classes_Parser`, returns a `files` entry with path `global-classes` (written as `global-classes.json` in the ZIP).

### 3. Import Runner

`runners/import.php` extends `Import_Runner_Base`:

- **`should_import`**: checks `settings` in include, `extracted_directory_path` exists, and classes are enabled.
- **`import`**: reads `global-classes.json` from the extracted kit. Supports two modes:
  - **Override all** (`classesOverrideAll`): replaces all existing classes.
  - **Merge** (default): merges imported classes with existing ones, renaming IDs and labels on conflict.

---

## Key Classes Reference

| Class | Path | Role |
|-------|------|------|
| `Module` | `app/modules/import-export-customization/module.php` | Public API: `export_kit()`, `import_kit()`, `upload_kit()`, `revert_last_imported_kit()` |
| `Export` | `app/modules/import-export-customization/processes/export.php` | ZIP creation, runner orchestration, manifest assembly |
| `Import` | `app/modules/import-export-customization/processes/import.php` | ZIP extraction, session management, runner orchestration, deferred element save |
| `Revert` | `app/modules/import-export-customization/processes/revert.php` | Undo last import via runner metadata + session ID meta |
| `Utils` | `app/modules/import-export-customization/utils.php` | JSON I/O, post/term ID mapping, CPT helpers, session cleanup |
| `Controller` | `app/modules/import-export-customization/data/controller.php` | REST API routes registration |
| `Export_Runner_Base` | `app/modules/import-export-customization/runners/export/export-runner-base.php` | Abstract base for export runners |
| `Import_Runner_Base` | `app/modules/import-export-customization/runners/import/import-runner-base.php` | Abstract base for import runners |
| `Revert_Runner_Base` | `app/modules/import-export-customization/runners/revert/revert-runner-base.php` | Abstract base for revert runners |
| `Runner_Interface` | `app/modules/import-export-customization/runners/runner-interface.php` | Shared interface for all runners |
