# Modules / Audits (PHP) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the `modules/audits/` PHP module: a filter-driven registry of 12 audit descriptors, a single REST endpoint that returns WordPress-side context the editor audits need, and the editor-bundle enqueue + inline config that exposes everything to the JS layer.

**Architecture:** Standard Elementor module pattern (extends `Core\Base\Module`). Built around three small responsibilities: (1) describe audits as immutable value objects collected by an `Audits_Manager` and filtered via `elementor/audits/audits` so other plugins can append; (2) one REST endpoint at `data/audits/page-context` that returns the post title, excerpt, featured image, requested attachment sizes and kit-defaults flag in a single call; (3) on `elementor/editor/before_enqueue_scripts`, enqueue the editor bundle (built in Plan 3) and inline-print `window.elementorAudits`.

**Tech Stack:** PHP 7.4+, Elementor's `Core\Base\Module`, `Data\V2\Base\Controller`, `Data\V2\Base\Endpoint`, PHPUnit, PHPCS (WordPress coding standards).

**Spec reference:** `docs/superpowers/specs/2026-05-28-editor-audit-panel-design.md` §4 (PHP module).

---

## Prerequisites

- Working on the same branch (or a parallel branch off `master`) as Plan 1. The PHP module and the floating-panels package don't share files, so they can be developed in parallel.
- Composer dependencies installed: `composer install`.
- PHPUnit setup verified: `vendor/bin/phpunit --testsuite Elementor` runs cleanly on master.
- PHPCS: `vendor/bin/phpcs --extensions=php --standard=./ruleset.xml modules/checklist` runs cleanly (baseline for the new module).

## File structure

```
modules/audits/
├── module.php                              # Core\Base\Module subclass; registers filter, enqueues bundle, inline config
├── audits-manager.php                      # collects descriptors, applies filter, exposes a flat array
├── audits/
│   ├── audit-descriptor.php                # abstract base value object
│   ├── missing-page-title.php
│   ├── missing-excerpt.php
│   ├── missing-featured-image.php
│   ├── uses-sections-or-columns.php
│   ├── default-design-system.php
│   ├── heading-structure.php
│   ├── images-missing-alt.php
│   ├── images-too-large.php
│   ├── prefer-global-colors.php
│   ├── image-carousel-default-name.php
│   ├── nested-boxed-containers.php
│   └── icon-widget-link-missing-aria-label.php
└── data/
    ├── controller.php                      # Data\V2\Base\Controller
    └── endpoints/
        └── page-context.php                # Data\V2\Base\Endpoint

tests/phpunit/elementor/modules/audits/
├── test-module.php
├── test-audits-manager.php
└── test-page-context-endpoint.php
```

No file exceeds ~300 lines.

---

## Task 1: Scaffold module + register in modules manager

**Files:**
- Create: `modules/audits/module.php`
- Modify: `core/modules-manager.php` — append `'audits'` to `get_modules_names()`

- [ ] **Step 1: Write the failing module test**

Create `tests/phpunit/elementor/modules/audits/test-module.php`:

```php
<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Audits;

use Elementor\Modules\Audits\Module;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Test_Module extends TestCase {
    public function test_module_name_is_audits() {
        // Arrange / Act.
        $module = Module::instance();

        // Assert.
        $this->assertSame( 'audits', $module->get_name() );
    }
}
```

- [ ] **Step 2: Run the test (expect failure)**

```bash
vendor/bin/phpunit tests/phpunit/elementor/modules/audits/test-module.php
```

Expected: FAIL — class `Elementor\Modules\Audits\Module` not found.

- [ ] **Step 3: Create the module class**

Create `modules/audits/module.php`:

```php
<?php

namespace Elementor\Modules\Audits;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class Module extends BaseModule {
    const FILTER_AUDITS = 'elementor/audits/audits';
    const REST_NAMESPACE = 'elementor/v1';

    public function get_name(): string {
        return 'audits';
    }
}
```

- [ ] **Step 4: Register the module**

Open `core/modules-manager.php`. In `get_modules_names()`, append `'audits'` after `'checklist'` (sibling concern, similar in nature):

```php
'checklist',
'audits',
'cloud-library',
```

- [ ] **Step 5: Run the module test (expect pass)**

```bash
vendor/bin/phpunit tests/phpunit/elementor/modules/audits/test-module.php
```

Expected: PASS — 1 test.

- [ ] **Step 6: Lint passes**

```bash
vendor/bin/phpcs --extensions=php --standard=./ruleset.xml modules/audits
```

Expected: PASS (no errors).

- [ ] **Step 7: Commit**

```bash
git add modules/audits core/modules-manager.php tests/phpunit/elementor/modules/audits
git commit -m "feat(audits): scaffold Audits PHP module"
```

---

## Task 2: Audit_Descriptor abstract base

The descriptor is a pure value object with abstract getters. Concrete audits (Task 4) extend it.

**Files:**
- Create: `modules/audits/audits/audit-descriptor.php`

- [ ] **Step 1: Implement the abstract**

Create `modules/audits/audits/audit-descriptor.php`:

```php
<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

abstract class Audit_Descriptor {
    const SEVERITY_ERROR = 'error';
    const SEVERITY_WARNING = 'warning';
    const SEVERITY_INFO = 'info';

    const CATEGORY_HEALTH = 'health';
    const CATEGORY_SEO = 'seo';
    const CATEGORY_ACCESSIBILITY = 'accessibility';
    const CATEGORY_PERFORMANCE = 'performance';
    const CATEGORY_BEST_PRACTICES = 'best-practices';

    abstract public function get_id(): string;

    abstract public function get_title(): string;

    abstract public function get_description(): string;

    abstract public function get_fix_hint(): string;

    /**
     * @return string[] One or more category constants from CATEGORY_*.
     */
    abstract public function get_categories(): array;

    /**
     * @return string One of SEVERITY_ERROR, SEVERITY_WARNING, SEVERITY_INFO.
     */
    abstract public function get_severity(): string;

    abstract public function get_weight(): int;

    public function is_visible(): bool {
        return true;
    }

    public function to_array(): array {
        return [
            'id'          => $this->get_id(),
            'title'       => $this->get_title(),
            'description' => $this->get_description(),
            'fixHint'     => $this->get_fix_hint(),
            'categories'  => $this->get_categories(),
            'severity'    => $this->get_severity(),
            'weight'      => $this->get_weight(),
        ];
    }
}
```

- [ ] **Step 2: Lint passes**

```bash
vendor/bin/phpcs --extensions=php --standard=./ruleset.xml modules/audits/audits
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add modules/audits/audits/audit-descriptor.php
git commit -m "feat(audits): Audit_Descriptor abstract value object"
```

---

## Task 3: Audits_Manager with filter

**Files:**
- Create: `modules/audits/audits-manager.php`
- Create: `tests/phpunit/elementor/modules/audits/test-audits-manager.php`

- [ ] **Step 1: Write the failing manager test**

Create `tests/phpunit/elementor/modules/audits/test-audits-manager.php`:

```php
<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Audits;

use Elementor\Modules\Audits\Audits\Audit_Descriptor;
use Elementor\Modules\Audits\Audits_Manager;
use Elementor\Modules\Audits\Module;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Fake_Audit extends Audit_Descriptor {
    public function get_id(): string { return 'fake/audit'; }
    public function get_title(): string { return 'Fake'; }
    public function get_description(): string { return 'desc'; }
    public function get_fix_hint(): string { return 'fix'; }
    public function get_categories(): array { return [ self::CATEGORY_SEO ]; }
    public function get_severity(): string { return self::SEVERITY_WARNING; }
    public function get_weight(): int { return 1; }
}

class Test_Audits_Manager extends TestCase {
    public function setUp(): void {
        parent::setUp();
        remove_all_filters( Module::FILTER_AUDITS );
    }

    public function test_returns_built_in_descriptors_as_arrays() {
        // Arrange.
        $manager = new Audits_Manager();

        // Act.
        $descriptors = $manager->get_descriptors();

        // Assert.
        $this->assertNotEmpty( $descriptors );
        $ids = array_column( $descriptors, 'id' );
        $this->assertContains( 'audits/missing-page-title', $ids );
        $this->assertContains( 'audits/icon-widget-link-missing-aria-label', $ids );
    }

    public function test_third_parties_can_append_via_filter() {
        // Arrange.
        $manager = new Audits_Manager();
        add_filter( Module::FILTER_AUDITS, function( $audits ) {
            $audits[] = new Fake_Audit();
            return $audits;
        } );

        // Act.
        $descriptors = $manager->get_descriptors();

        // Assert.
        $ids = array_column( $descriptors, 'id' );
        $this->assertContains( 'fake/audit', $ids );
    }

    public function test_invisible_audits_are_excluded() {
        // Arrange.
        $invisible = new class extends Fake_Audit {
            public function is_visible(): bool { return false; }
        };
        $manager = new Audits_Manager();
        add_filter( Module::FILTER_AUDITS, function( $audits ) use ( $invisible ) {
            $audits[] = $invisible;
            return $audits;
        } );

        // Act.
        $descriptors = $manager->get_descriptors();

        // Assert.
        $ids = array_column( $descriptors, 'id' );
        $this->assertNotContains( $invisible->get_id(), $ids );
    }
}
```

- [ ] **Step 2: Run test (expect failure)**

```bash
vendor/bin/phpunit tests/phpunit/elementor/modules/audits/test-audits-manager.php
```

Expected: FAIL — class `Audits_Manager` not found.

- [ ] **Step 3: Implement Audits_Manager**

Create `modules/audits/audits-manager.php`:

```php
<?php

namespace Elementor\Modules\Audits;

use Elementor\Modules\Audits\Audits\Audit_Descriptor;
use Elementor\Modules\Audits\Audits\Default_Design_System;
use Elementor\Modules\Audits\Audits\Heading_Structure;
use Elementor\Modules\Audits\Audits\Icon_Widget_Link_Missing_Aria_Label;
use Elementor\Modules\Audits\Audits\Image_Carousel_Default_Name;
use Elementor\Modules\Audits\Audits\Images_Missing_Alt;
use Elementor\Modules\Audits\Audits\Images_Too_Large;
use Elementor\Modules\Audits\Audits\Missing_Excerpt;
use Elementor\Modules\Audits\Audits\Missing_Featured_Image;
use Elementor\Modules\Audits\Audits\Missing_Page_Title;
use Elementor\Modules\Audits\Audits\Nested_Boxed_Containers;
use Elementor\Modules\Audits\Audits\Prefer_Global_Colors;
use Elementor\Modules\Audits\Audits\Uses_Sections_Or_Columns;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class Audits_Manager {
    public function get_descriptors(): array {
        $audits = $this->get_built_in_audits();
        $audits = apply_filters( Module::FILTER_AUDITS, $audits );

        $arrays = [];
        foreach ( $audits as $audit ) {
            if ( ! $audit instanceof Audit_Descriptor ) {
                continue;
            }
            if ( ! $audit->is_visible() ) {
                continue;
            }
            $arrays[] = $audit->to_array();
        }

        return $arrays;
    }

    /**
     * @return Audit_Descriptor[]
     */
    private function get_built_in_audits(): array {
        return [
            new Missing_Page_Title(),
            new Missing_Excerpt(),
            new Missing_Featured_Image(),
            new Uses_Sections_Or_Columns(),
            new Default_Design_System(),
            new Heading_Structure(),
            new Images_Missing_Alt(),
            new Images_Too_Large(),
            new Prefer_Global_Colors(),
            new Image_Carousel_Default_Name(),
            new Nested_Boxed_Containers(),
            new Icon_Widget_Link_Missing_Aria_Label(),
        ];
    }
}
```

This will fail to compile until Task 4 creates the concrete classes. That's the point — we let TDD pull them in.

- [ ] **Step 4: Run test (expect failure for a different reason now)**

```bash
vendor/bin/phpunit tests/phpunit/elementor/modules/audits/test-audits-manager.php
```

Expected: FAIL — class `Missing_Page_Title` not found.

- [ ] **Step 5: Commit (broken state intentional — fixed in Task 4)**

```bash
git add modules/audits/audits-manager.php tests/phpunit/elementor/modules/audits/test-audits-manager.php
git commit -m "feat(audits): Audits_Manager with filter (concrete audits pending)"
```

---

## Task 4: The 12 concrete descriptors

Each descriptor is a small class. Done in one task because they're all the same shape.

**Files:**
- Create: 12 files in `modules/audits/audits/`

- [ ] **Step 1: Create all 12 descriptors**

Create one file per audit. Verbatim contents below.

`modules/audits/audits/missing-page-title.php`:

```php
<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Missing_Page_Title extends Audit_Descriptor {
    public function get_id(): string {
        return 'audits/missing-page-title';
    }

    public function get_title(): string {
        return esc_html__( 'Missing page title', 'elementor' );
    }

    public function get_description(): string {
        return esc_html__( 'Pages need a clear title for SEO and screen-reader navigation.', 'elementor' );
    }

    public function get_fix_hint(): string {
        return esc_html__( 'Open Page Settings and add a title.', 'elementor' );
    }

    public function get_categories(): array {
        return [ self::CATEGORY_SEO, self::CATEGORY_ACCESSIBILITY ];
    }

    public function get_severity(): string {
        return self::SEVERITY_ERROR;
    }

    public function get_weight(): int {
        return 10;
    }
}
```

`modules/audits/audits/missing-excerpt.php`:

```php
<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Missing_Excerpt extends Audit_Descriptor {
    public function get_id(): string {
        return 'audits/missing-excerpt';
    }

    public function get_title(): string {
        return esc_html__( 'Missing page excerpt', 'elementor' );
    }

    public function get_description(): string {
        return esc_html__( 'A descriptive excerpt helps search engines and previews summarize the page.', 'elementor' );
    }

    public function get_fix_hint(): string {
        return esc_html__( 'Open Page Settings and write a short excerpt.', 'elementor' );
    }

    public function get_categories(): array {
        return [ self::CATEGORY_SEO, self::CATEGORY_ACCESSIBILITY ];
    }

    public function get_severity(): string {
        return self::SEVERITY_WARNING;
    }

    public function get_weight(): int {
        return 5;
    }
}
```

`modules/audits/audits/missing-featured-image.php`:

```php
<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Missing_Featured_Image extends Audit_Descriptor {
    public function get_id(): string {
        return 'audits/missing-featured-image';
    }

    public function get_title(): string {
        return esc_html__( 'Missing featured image', 'elementor' );
    }

    public function get_description(): string {
        return esc_html__( 'Featured images are used by social shares and many themes for hero visuals.', 'elementor' );
    }

    public function get_fix_hint(): string {
        return esc_html__( 'Open Page Settings and set a featured image.', 'elementor' );
    }

    public function get_categories(): array {
        return [ self::CATEGORY_SEO ];
    }

    public function get_severity(): string {
        return self::SEVERITY_WARNING;
    }

    public function get_weight(): int {
        return 5;
    }
}
```

`modules/audits/audits/uses-sections-or-columns.php`:

```php
<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Uses_Sections_Or_Columns extends Audit_Descriptor {
    public function get_id(): string {
        return 'audits/uses-sections-or-columns';
    }

    public function get_title(): string {
        return esc_html__( 'Uses outdated sections or columns', 'elementor' );
    }

    public function get_description(): string {
        return esc_html__( 'Sections and columns are legacy elements. Containers render fewer DOM nodes and are more flexible.', 'elementor' );
    }

    public function get_fix_hint(): string {
        return esc_html__( 'Use the Container Converter to replace each section/column with a container.', 'elementor' );
    }

    public function get_categories(): array {
        return [ self::CATEGORY_HEALTH, self::CATEGORY_PERFORMANCE ];
    }

    public function get_severity(): string {
        return self::SEVERITY_WARNING;
    }

    public function get_weight(): int {
        return 7;
    }
}
```

`modules/audits/audits/default-design-system.php`:

```php
<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Default_Design_System extends Audit_Descriptor {
    public function get_id(): string {
        return 'audits/default-design-system';
    }

    public function get_title(): string {
        return esc_html__( 'Default website kit is in use', 'elementor' );
    }

    public function get_description(): string {
        return esc_html__( 'Your site is using the default design system colors and fonts. Custom branding makes the site feel uniquely yours.', 'elementor' );
    }

    public function get_fix_hint(): string {
        return esc_html__( 'Open Site Settings and customize your kit (colors, fonts, layout).', 'elementor' );
    }

    public function get_categories(): array {
        return [ self::CATEGORY_HEALTH, self::CATEGORY_BEST_PRACTICES ];
    }

    public function get_severity(): string {
        return self::SEVERITY_INFO;
    }

    public function get_weight(): int {
        return 3;
    }
}
```

`modules/audits/audits/heading-structure.php`:

```php
<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Heading_Structure extends Audit_Descriptor {
    public function get_id(): string {
        return 'audits/heading-structure';
    }

    public function get_title(): string {
        return esc_html__( 'Heading structure', 'elementor' );
    }

    public function get_description(): string {
        return esc_html__( 'Pages should have exactly one H1 and a non-skipping heading order. Screen readers and search engines rely on this structure.', 'elementor' );
    }

    public function get_fix_hint(): string {
        return esc_html__( 'Ensure your page has one H1 and that heading levels do not skip (no H2 → H4).', 'elementor' );
    }

    public function get_categories(): array {
        return [ self::CATEGORY_SEO, self::CATEGORY_ACCESSIBILITY ];
    }

    public function get_severity(): string {
        return self::SEVERITY_ERROR;
    }

    public function get_weight(): int {
        return 10;
    }
}
```

`modules/audits/audits/images-missing-alt.php`:

```php
<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Images_Missing_Alt extends Audit_Descriptor {
    public function get_id(): string {
        return 'audits/images-missing-alt';
    }

    public function get_title(): string {
        return esc_html__( 'Images missing alt text', 'elementor' );
    }

    public function get_description(): string {
        return esc_html__( 'Every image needs a meaningful alt attribute for screen readers and image-search.', 'elementor' );
    }

    public function get_fix_hint(): string {
        return esc_html__( 'Open the image\'s settings and add an Alt Text describing the image.', 'elementor' );
    }

    public function get_categories(): array {
        return [ self::CATEGORY_SEO, self::CATEGORY_ACCESSIBILITY ];
    }

    public function get_severity(): string {
        return self::SEVERITY_ERROR;
    }

    public function get_weight(): int {
        return 10;
    }
}
```

`modules/audits/audits/images-too-large.php`:

```php
<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Images_Too_Large extends Audit_Descriptor {
    public function get_id(): string {
        return 'audits/images-too-large';
    }

    public function get_title(): string {
        return esc_html__( 'Oversized images', 'elementor' );
    }

    public function get_description(): string {
        return esc_html__( 'Large image files slow down the page. Compress or resize images above 500 KB.', 'elementor' );
    }

    public function get_fix_hint(): string {
        return esc_html__( 'Replace the image with a smaller version or enable image optimization.', 'elementor' );
    }

    public function get_categories(): array {
        return [ self::CATEGORY_PERFORMANCE ];
    }

    public function get_severity(): string {
        return self::SEVERITY_WARNING;
    }

    public function get_weight(): int {
        return 7;
    }
}
```

`modules/audits/audits/prefer-global-colors.php`:

```php
<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Prefer_Global_Colors extends Audit_Descriptor {
    public function get_id(): string {
        return 'audits/prefer-global-colors';
    }

    public function get_title(): string {
        return esc_html__( 'Prefer global colors over hard-coded values', 'elementor' );
    }

    public function get_description(): string {
        return esc_html__( 'Global colors make the design consistent and easy to update site-wide.', 'elementor' );
    }

    public function get_fix_hint(): string {
        return esc_html__( 'Replace the hard-coded color with one of your kit\'s global colors.', 'elementor' );
    }

    public function get_categories(): array {
        return [ self::CATEGORY_HEALTH, self::CATEGORY_BEST_PRACTICES ];
    }

    public function get_severity(): string {
        return self::SEVERITY_INFO;
    }

    public function get_weight(): int {
        return 3;
    }
}
```

`modules/audits/audits/image-carousel-default-name.php`:

```php
<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Image_Carousel_Default_Name extends Audit_Descriptor {
    public function get_id(): string {
        return 'audits/image-carousel-default-name';
    }

    public function get_title(): string {
        return esc_html__( 'Image carousel uses its default accessible name', 'elementor' );
    }

    public function get_description(): string {
        return esc_html__( 'A generic name like "Image Carousel" is not descriptive for screen readers or for search engines.', 'elementor' );
    }

    public function get_fix_hint(): string {
        return esc_html__( 'Set a meaningful accessible name based on what the carousel actually contains.', 'elementor' );
    }

    public function get_categories(): array {
        return [ self::CATEGORY_ACCESSIBILITY, self::CATEGORY_SEO ];
    }

    public function get_severity(): string {
        return self::SEVERITY_WARNING;
    }

    public function get_weight(): int {
        return 5;
    }
}
```

`modules/audits/audits/nested-boxed-containers.php`:

```php
<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Nested_Boxed_Containers extends Audit_Descriptor {
    public function get_id(): string {
        return 'audits/nested-boxed-containers';
    }

    public function get_title(): string {
        return esc_html__( 'Boxed container nested inside a boxed parent', 'elementor' );
    }

    public function get_description(): string {
        return esc_html__( 'An inner container does not need to be boxed when its parent already is. Making it full-width reduces DOM nodes and improves performance.', 'elementor' );
    }

    public function get_fix_hint(): string {
        return esc_html__( 'Change the inner container\'s content width to Full Width.', 'elementor' );
    }

    public function get_categories(): array {
        return [ self::CATEGORY_PERFORMANCE, self::CATEGORY_HEALTH ];
    }

    public function get_severity(): string {
        return self::SEVERITY_WARNING;
    }

    public function get_weight(): int {
        return 5;
    }
}
```

`modules/audits/audits/icon-widget-link-missing-aria-label.php`:

```php
<?php

namespace Elementor\Modules\Audits\Audits;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Icon_Widget_Link_Missing_Aria_Label extends Audit_Descriptor {
    public function get_id(): string {
        return 'audits/icon-widget-link-missing-aria-label';
    }

    public function get_title(): string {
        return esc_html__( 'Icon link missing aria-label', 'elementor' );
    }

    public function get_description(): string {
        return esc_html__( 'Icon-only links need an aria-label (or aria-labelledby) so screen readers can announce the link target.', 'elementor' );
    }

    public function get_fix_hint(): string {
        return esc_html__( 'Add an aria-label custom attribute to the icon widget describing the link\'s destination.', 'elementor' );
    }

    public function get_categories(): array {
        return [ self::CATEGORY_ACCESSIBILITY ];
    }

    public function get_severity(): string {
        return self::SEVERITY_WARNING;
    }

    public function get_weight(): int {
        return 5;
    }
}
```

- [ ] **Step 2: Run the manager test**

```bash
vendor/bin/phpunit tests/phpunit/elementor/modules/audits/test-audits-manager.php
```

Expected: PASS — 3 tests.

- [ ] **Step 3: Lint passes**

```bash
vendor/bin/phpcs --extensions=php --standard=./ruleset.xml modules/audits
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add modules/audits/audits
git commit -m "feat(audits): 12 built-in audit descriptors"
```

---

## Task 5: REST controller

**Files:**
- Create: `modules/audits/data/controller.php`

- [ ] **Step 1: Implement the controller**

Create `modules/audits/data/controller.php`:

```php
<?php

namespace Elementor\Modules\Audits\Data;

use Elementor\Data\V2\Base\Controller as Controller_Base;
use Elementor\Modules\Audits\Data\Endpoints\Page_Context;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class Controller extends Controller_Base {
    public function get_name(): string {
        return 'audits';
    }

    public function register_endpoints() {
        $this->register_endpoint( new Page_Context( $this ) );
    }

    public function get_items_permissions_check( $request ) {
        $document_id = (int) $request->get_param( 'document_id' );
        return $document_id > 0 && current_user_can( 'edit_post', $document_id );
    }

    public function get_item_permissions_check( $request ) {
        return $this->get_items_permissions_check( $request );
    }
}
```

- [ ] **Step 2: Lint passes**

```bash
vendor/bin/phpcs --extensions=php --standard=./ruleset.xml modules/audits/data/controller.php
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add modules/audits/data/controller.php
git commit -m "feat(audits): REST controller"
```

---

## Task 6: page-context endpoint

**Files:**
- Create: `modules/audits/data/endpoints/page-context.php`
- Create: `tests/phpunit/elementor/modules/audits/test-page-context-endpoint.php`

- [ ] **Step 1: Write the failing endpoint tests**

Create `tests/phpunit/elementor/modules/audits/test-page-context-endpoint.php`:

```php
<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Audits;

use Elementor\Modules\Audits\Data\Endpoints\Page_Context;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Test_Page_Context_Endpoint extends TestCase {
    private $post_id;
    private $attachment_id;
    private $admin_user_id;

    public function setUp(): void {
        parent::setUp();

        $this->admin_user_id = $this->factory()->user->create( [ 'role' => 'administrator' ] );
        wp_set_current_user( $this->admin_user_id );

        $this->post_id = $this->factory()->post->create( [
            'post_title'   => 'Hello',
            'post_excerpt' => 'World',
        ] );

        $this->attachment_id = $this->factory()->attachment->create_upload_object(
            __DIR__ . '/fixtures/sample.jpg',
            $this->post_id
        );
    }

    public function tearDown(): void {
        wp_delete_post( $this->post_id, true );
        wp_delete_attachment( $this->attachment_id, true );
        wp_delete_user( $this->admin_user_id );
        parent::tearDown();
    }

    private function factory() {
        return new \WP_UnitTest_Factory();
    }

    public function test_returns_post_title_and_excerpt() {
        // Arrange.
        $request = new \WP_REST_Request( 'GET', '' );
        $request->set_param( 'document_id', $this->post_id );

        // Act.
        $response = ( new Page_Context( $this->build_controller() ) )->get_items( $request );

        // Assert.
        $this->assertSame( 'Hello', $response['post_title'] );
        $this->assertSame( 'World', $response['post_excerpt'] );
    }

    public function test_returns_null_excerpt_when_empty() {
        // Arrange.
        wp_update_post( [ 'ID' => $this->post_id, 'post_excerpt' => '' ] );
        $request = new \WP_REST_Request( 'GET', '' );
        $request->set_param( 'document_id', $this->post_id );

        // Act.
        $response = ( new Page_Context( $this->build_controller() ) )->get_items( $request );

        // Assert.
        $this->assertNull( $response['post_excerpt'] );
    }

    public function test_image_sizes_limited_to_passed_attachment_ids() {
        // Arrange.
        $request = new \WP_REST_Request( 'GET', '' );
        $request->set_param( 'document_id', $this->post_id );
        $request->set_param( 'attachment_ids', [ $this->attachment_id ] );

        // Act.
        $response = ( new Page_Context( $this->build_controller() ) )->get_items( $request );

        // Assert.
        $this->assertArrayHasKey( $this->attachment_id, $response['image_sizes'] );
        $this->assertArrayHasKey( 'filesize_bytes', $response['image_sizes'][ $this->attachment_id ] );
    }

    public function test_image_sizes_empty_when_no_attachment_ids_passed() {
        // Arrange.
        $request = new \WP_REST_Request( 'GET', '' );
        $request->set_param( 'document_id', $this->post_id );

        // Act.
        $response = ( new Page_Context( $this->build_controller() ) )->get_items( $request );

        // Assert.
        $this->assertSame( [], $response['image_sizes'] );
    }

    private function build_controller() {
        return new \Elementor\Modules\Audits\Data\Controller();
    }
}
```

Note: the test references a fixture `fixtures/sample.jpg` (a small valid JPG, ~5 KB). Create it before running with: `cp tests/phpunit/fixtures/sample.jpg tests/phpunit/elementor/modules/audits/fixtures/sample.jpg` if such a fixture exists, otherwise generate one (`convert -size 10x10 xc:red tests/phpunit/elementor/modules/audits/fixtures/sample.jpg`).

- [ ] **Step 2: Run tests (expect failure)**

```bash
vendor/bin/phpunit tests/phpunit/elementor/modules/audits/test-page-context-endpoint.php
```

Expected: FAIL — class `Page_Context` not found.

- [ ] **Step 3: Implement the endpoint**

Create `modules/audits/data/endpoints/page-context.php`:

```php
<?php

namespace Elementor\Modules\Audits\Data\Endpoints;

use Elementor\Data\V2\Base\Endpoint as Endpoint_Base;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class Page_Context extends Endpoint_Base {
    public function get_name(): string {
        return 'page-context';
    }

    public function get_format(): string {
        return 'audits/page-context';
    }

    public function get_items( $request ) {
        $document_id = (int) $request->get_param( 'document_id' );
        $attachment_ids = array_map( 'intval', (array) $request->get_param( 'attachment_ids' ) );

        $post = get_post( $document_id );

        return [
            'post_title'                => $post && '' !== $post->post_title ? $post->post_title : null,
            'post_excerpt'              => $post && '' !== $post->post_excerpt ? $post->post_excerpt : null,
            'featured_image_id'         => $post ? ( get_post_thumbnail_id( $post ) ?: null ) : null,
            'image_sizes'               => $this->collect_image_sizes( $attachment_ids ),
            'kit_id'                    => (int) get_option( 'elementor_active_kit' ),
            'kit_is_default_unchanged'  => $this->is_default_kit_unchanged(),
        ];
    }

    protected function register() {
        parent::register();
        $this->register_items_route();
    }

    private function collect_image_sizes( array $attachment_ids ): array {
        $result = [];
        foreach ( $attachment_ids as $attachment_id ) {
            if ( ! wp_attachment_is_image( $attachment_id ) ) {
                continue;
            }
            $metadata = wp_get_attachment_metadata( $attachment_id );
            $file_path = get_attached_file( $attachment_id );

            $result[ $attachment_id ] = [
                'width'           => isset( $metadata['width'] ) ? (int) $metadata['width'] : 0,
                'height'          => isset( $metadata['height'] ) ? (int) $metadata['height'] : 0,
                'filesize_bytes'  => $file_path && file_exists( $file_path ) ? (int) filesize( $file_path ) : 0,
                'mime'            => get_post_mime_type( $attachment_id ) ?: '',
                'src'             => wp_get_attachment_url( $attachment_id ) ?: '',
            ];
        }
        return $result;
    }

    private function is_default_kit_unchanged(): bool {
        $kit_id = (int) get_option( 'elementor_active_kit' );
        if ( ! $kit_id ) {
            return false;
        }
        // Heuristic: a kit is considered unchanged if its modified date equals its created date.
        $kit_post = get_post( $kit_id );
        if ( ! $kit_post ) {
            return false;
        }
        return $kit_post->post_date_gmt === $kit_post->post_modified_gmt;
    }
}
```

The default-kit heuristic is intentionally simple. If it turns out to be too coarse in QA, it can be tightened in a follow-up.

- [ ] **Step 4: Run tests (expect pass)**

```bash
vendor/bin/phpunit tests/phpunit/elementor/modules/audits/test-page-context-endpoint.php
```

Expected: PASS — 4 tests.

- [ ] **Step 5: Lint passes**

```bash
vendor/bin/phpcs --extensions=php --standard=./ruleset.xml modules/audits
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add modules/audits/data/endpoints tests/phpunit/elementor/modules/audits/test-page-context-endpoint.php tests/phpunit/elementor/modules/audits/fixtures
git commit -m "feat(audits): page-context REST endpoint"
```

---

## Task 7: Wire enqueue + inline config in module.php

**Files:**
- Modify: `modules/audits/module.php`

- [ ] **Step 1: Add a test for enqueue behavior**

Append to `tests/phpunit/elementor/modules/audits/test-module.php` (inside the same class):

```php
public function test_inline_config_is_printed_when_editor_assets_enqueue() {
    // Arrange.
    $module = Module::instance();
    $module->register_data_controller(); // see Module impl below
    wp_register_script( 'elementor-audits', 'http://example.test/audits.js', [], '1.0', true );

    // Act.
    do_action( 'elementor/editor/before_enqueue_scripts' );

    // Assert: the inline script body must contain the global init.
    $inline = wp_scripts()->get_data( 'elementor-audits', 'data' );
    $this->assertIsString( $inline );
    $this->assertStringContainsString( 'window.elementorAudits', $inline );
    $this->assertStringContainsString( '"audits"', $inline );
}
```

- [ ] **Step 2: Run (expect failure)**

```bash
vendor/bin/phpunit tests/phpunit/elementor/modules/audits/test-module.php
```

Expected: FAIL — `register_data_controller` not defined.

- [ ] **Step 3: Update module.php**

Replace `modules/audits/module.php`:

```php
<?php

namespace Elementor\Modules\Audits;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\Audits\Data\Controller;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class Module extends BaseModule {
    const FILTER_AUDITS = 'elementor/audits/audits';
    const REST_NAMESPACE = 'elementor/v1';

    private Audits_Manager $audits_manager;

    public function __construct() {
        parent::__construct();
        $this->audits_manager = new Audits_Manager();
        $this->register_data_controller();

        add_action( 'elementor/editor/before_enqueue_scripts', function () {
            $this->enqueue_editor_scripts();
        } );
    }

    public function get_name(): string {
        return 'audits';
    }

    public function register_data_controller(): void {
        Plugin::$instance->data_manager_v2->register_controller( new Controller() );
    }

    private function enqueue_editor_scripts(): void {
        $min_suffix = Utils::is_script_debug() ? '' : '.min';

        wp_enqueue_script(
            'elementor-audits',
            ELEMENTOR_ASSETS_URL . 'js/audits' . $min_suffix . '.js',
            [
                'react',
                'react-dom',
                'elementor-common',
                'elementor-v2-ui',
                'elementor-v2-icons',
                'elementor-v2-editor-app-bar',
                'elementor-web-cli',
            ],
            ELEMENTOR_VERSION,
            true
        );

        wp_set_script_translations( 'elementor-audits', 'elementor' );

        wp_add_inline_script(
            'elementor-audits',
            'window.elementorAudits = ' . wp_json_encode( [
                'audits'        => $this->audits_manager->get_descriptors(),
                'restNamespace' => self::REST_NAMESPACE,
                'nonce'         => wp_create_nonce( 'wp_rest' ),
            ] ) . ';',
            'before'
        );
    }
}
```

- [ ] **Step 4: Run tests (expect pass)**

```bash
vendor/bin/phpunit tests/phpunit/elementor/modules/audits
```

Expected: PASS — all module + manager + endpoint tests.

- [ ] **Step 5: Lint passes**

```bash
vendor/bin/phpcs --extensions=php --standard=./ruleset.xml modules/audits
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add modules/audits/module.php tests/phpunit/elementor/modules/audits/test-module.php
git commit -m "feat(audits): enqueue editor bundle + inline window.elementorAudits config"
```

---

## Task 8: Smoke-test on a live editor screen

This task has no test code — it's a manual verification step.

- [ ] **Step 1: Start a WP environment**

Either:

```bash
SKIP_CONFIRMATION=true npm run env:setup
```

or

```bash
npm run wp-playground
```

- [ ] **Step 2: Open the editor in the browser**

For wp-lite-env: `http://localhost:8888/wp-admin/edit.php`, edit any post in Elementor.
For wp-playground: `http://127.0.0.1:9400`, do the same.

- [ ] **Step 3: Verify the inline config is present**

In DevTools console:

```js
window.elementorAudits
```

Expected: an object with `audits` (array of 12 descriptors), `restNamespace: 'elementor/v1'`, and a `nonce` string.

- [ ] **Step 4: Verify the REST endpoint responds**

In DevTools console:

```js
fetch( '/wp-json/elementor/v1/audits/page-context?document_id=' + elementor.config.document.id, {
    headers: { 'X-WP-Nonce': window.elementorAudits.nonce }
} ).then( r => r.json() ).then( console.log );
```

Expected: a JSON object with `post_title`, `post_excerpt`, `featured_image_id`, `image_sizes`, `kit_id`, `kit_is_default_unchanged`.

If permission check fires (`rest_forbidden`), confirm the logged-in user has `edit_post` capability on the document.

- [ ] **Step 5: Note any deviations**

If anything is missing or named differently, file a follow-up rather than fixing in this plan — the JS bundle (Plan 3) will surface real bugs.

---

## Task 9: Final checks

- [ ] **Step 1: Full PHPUnit run for the new module**

```bash
vendor/bin/phpunit tests/phpunit/elementor/modules/audits
```

Expected: PASS.

- [ ] **Step 2: PHPCS clean**

```bash
vendor/bin/phpcs --extensions=php --standard=./ruleset.xml modules/audits
```

Expected: PASS.

- [ ] **Step 3: Verify no other tests broke**

```bash
vendor/bin/phpunit --testsuite Elementor
```

Expected: PASS (same pass/fail counts as master before this work).

- [ ] **Step 4: Commit (if any drift)**

```bash
git status
# If anything changed (e.g. .lock files), commit them.
```

---

## Acceptance criteria

- `modules/audits/` is registered in `core/modules-manager.php` and loads in the editor.
- `apply_filters( 'elementor/audits/audits', [...] )` returns the 12 descriptors (plus any added by other plugins).
- `GET /wp-json/elementor/v1/audits/page-context?document_id=X&attachment_ids[]=Y` returns the documented payload with a proper capability check.
- `window.elementorAudits` is present in the editor and contains the 12 descriptors, REST namespace, and nonce.
- All PHPUnit tests for the module pass.
- PHPCS clean.

## Out of scope (deferred)

- Tighter detection for `kit_is_default_unchanged`. The current heuristic compares `post_date_gmt === post_modified_gmt`; can be replaced with a deep kit-diff if QA shows false positives.
- Caching the descriptors list. Acceptable to recompute on each request since the work is trivial and runs only when the editor enqueues.
- Per-audit i18n text-domain customization. All built-ins use `'elementor'` text domain.
