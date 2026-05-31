# Editor Audits Package Implementation Plan

> **Update (2026-05-31): floating-panels docking removed.** The `initialMode: 'docked'` field shown in this plan's `panel-instance.ts` snippet no longer exists; the audit panel now opens floating. See `docs/superpowers/specs/2026-05-31-floating-panels-remove-docking-design.md`.

> **Status (2026-05-29):** ✅ All 18 tasks complete. Code-only mode for E2E (T17) and PHPUnit assertions (T16's updated test) — see "Implementation notes & deviations" below for everything that diverged from this plan.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Implementation notes & deviations

1. **`package.json` dependency versions corrected.** Plan listed `@elementor/icons: "4.2.0"` and `@wordpress/i18n: "^4.0.0"`. Actual workspace versions are `~1.75.1` and `^5.13.0` respectively (verified against sibling packages like `editor-floating-panels` and `editor-app-bar`). Used the correct versions; the plan's would have failed `npm install`.

2. **`walkElements` rewritten as recursive instead of mutating array (T3).** The plan's BFS-via-`shift`/`unshift` had a non-null assertion (`stack.shift()!`) that ESLint's `no-non-null-assertion` rule rejects. Replaced with a small recursive helper — same depth-first pre-order output, no assertions.

3. **V1Element → ElementSnapshotNode adapter added (T7).** The plan's runner did `const tree = ( getElements() ?? [] ) as ElementsModelSnapshot['tree']` — a type lie. `@elementor/editor-elements` `getElements()` returns a flat `V1Element[]` (root + all descendants), not a tree, and each element exposes settings via `model.get('settings')` / `settings.toJSON()`, not a direct property. Added `src/lib/v1-snapshot.ts` with `buildSnapshotTree( elements )` that walks the root's `children` and converts each node to the snapshot shape evaluators expect. The runner's unit tests are unaffected (they mock `getElements()` to return `[]`); the adapter only matters in production.

4. **Modern `jest.mocked()` pattern used for runner test (T7).** The plan's test used the older `require('../api/page-context-client').fetchPageContext as jest.Mock` pattern. Switched to importing the mocked module normally and using `jest.mocked( fetchPageContext )` — cleaner, type-safe, and avoids `no-require-imports` lint errors.

5. **`useAuditToggleProps` returns an `icon` (T14).** Plan didn't include an `icon` field, but `ToggleActionProps` from `@elementor/editor-app-bar` requires `icon: ElementType`. Used `ShieldCheckIcon` from `@elementor/icons` (closest fit for "audit/quality check").

6. **`@wordpress/i18n` translator comments added where `sprintf` is used.** Plan inlined `sprintf( __( '%d issues found' ) )` without translator comments. Added `/* translators: %d is ... */` comments per WP-i18n best practice (also avoids `ExtractI18nWordpressExpressionsWebpackPlugin` warnings during prod build).

7. **CSS `insetInlineStart` instead of physical `left` in `ScoreGauge` (T11).** Plan used `left: 0` for the absolute-positioned progress arc. Replaced with `insetInlineStart: 0` for RTL safety, matching the convention established in Plan 1's floating panels.

8. **Magic numbers named (`SIZE_THRESHOLD_BYTES`, `BYTES_PER_KB`, `OVERALL_GAUGE_SIZE`, `MIN_WIDTH`/`MIN_HEIGHT`, `GOOD_THRESHOLD`/`OK_THRESHOLD`, `AUDIT_TOGGLE_PRIORITY`, `DEFAULT_WIDTH`/`DEFAULT_HEIGHT`).** Plan had `500 * 1024`, `> 90`, `>= 50`, etc. inline. Renamed per workspace coding standards (no magic numbers).

9. **T16 wiring redesigned to match the real architecture.** Plan said "find the editor bootstrap, add `import { init as initAudits } from '@elementor/editor-audits'; initAudits();`". The actual mechanism is different: `.grunt-config/webpack.packages.js` injects `window.elementorV2.${entryName}?.init?.();` at the end of each package bundle via `EntryInitializationWebpackPlugin`. Packages are loaded by registering them through the PHP filter `elementor/editor/v2/packages`. Refactored `modules/audits/module.php` (from Plan 2) to:
   - register both `editor-floating-panels` AND `editor-audits` via the `elementor/editor/v2/packages` filter (Plan 1 never wired `editor-floating-panels`; this finally does it)
   - print the `window.elementorAudits` inline config against the package's actual WP handle `elementor-v2-editor-audits` on the `elementor/editor/v2/scripts/enqueue` action
   - removed the broken manual `wp_enqueue_script( 'elementor-audits', ... )` that pointed to a non-existent `assets/js/audits.js`
   The PHPUnit test (`test-module.php`) was updated to assert against the filter contract and the new handle name. Test execution still deferred (Plan 2 code-only mode); `php -l` + PHPCS pass.

10. **T17 Playwright E2E written but not executed (code-only).** Mirrors Plan 2's code-only stance for runtime-dependent tests. The file is in place at `tests/playwright/sanity/modules/audits/audit-panel.test.ts`; the spec's selectors (`getByRole( 'button', { name: /audit page/i } )` etc.) will likely need fine-tuning against the actual `@elementor/ui` MUI output on a first live run — the plan itself flagged this in step 1.

11. **TDD checkpoint commits collapsed where the codebase would otherwise be broken between commits.** T2/T3/T4 followed strict TDD (red → green). T8 (12 evaluators) was committed in a single commit after all 12 + register-built-ins were in place — committing partial states would have left `register-built-ins.ts` referencing missing files. Same rationale as Plan 2's T3/T4 collapse.

12. **Lint pass at T18 required three manual `useState` migrations.** `local-rules/no-react-namespace` rejected `React.useState( ... )` even with `import * as React from 'react'`. Added named `useState` import alongside the namespace import (kept for JSX runtime under Jest) in `audit-panel.tsx`, `category-tab.tsx`, and `violation-row.tsx`. Final results: 49 Jest tests pass across 18 suites; 57/57 packages build (≈36 KB ESM, ≈40 KB CJS for editor-audits).

---


**Goal:** Ship the `@elementor/editor-audits` package — the user-facing audit feature. Reads descriptors from `window.elementorAudits.audits` (printed by Plan 2's PHP module), registers a JS evaluator per descriptor, runs the page audit on-demand, computes per-category and overall scores Lighthouse-style, and renders the result in a floating panel (from Plan 1) toggled from the editor app bar.

**Architecture:** A new workspace package depending on `@elementor/editor-floating-panels` (Plan 1), `@elementor/editor-elements`, `@elementor/editor-app-bar`, `@elementor/http-client`, `@elementor/store`, `@elementor/ui`, `@elementor/icons`. The package has four layers: (1) framework — `Audit` base class + registry + `runPageAudit` + score engine; (2) twelve concrete audit evaluators; (3) UI — panel shell, tabs, score gauges, violation rows; (4) integration — top-bar toggle + `init()` that registers everything with the floating-panels host.

**Tech Stack:** TypeScript, React 18, MUI via `@elementor/ui`, axios via `@elementor/http-client`, Jest + React Testing Library, Playwright for one happy-path E2E.

**Spec reference:** `docs/superpowers/specs/2026-05-28-editor-audit-panel-design.md` §3, §5, §7, §8.

**Prerequisites:** Plans 1 and 2 are merged or available on the same branch. `@elementor/editor-floating-panels` is published in the workspace. `modules/audits/` enqueues the bundle name `elementor-audits` and prints `window.elementorAudits`.

---

## File structure

```
packages/packages/core/editor-audits/
├── package.json
├── CHANGELOG.md
├── README.md
└── src/
    ├── index.ts                                  # public exports
    ├── init.ts                                   # called by the editor bootstrap
    ├── types.ts                                  # public TS types from spec §5
    ├── audit.ts                                  # abstract Audit class
    ├── registry.ts                               # registerAudit, getRegisteredAudits, hasEvaluator
    ├── runner.ts                                 # runPageAudit
    ├── score/
    │   ├── score.ts                              # compute per-category + overall score
    │   └── __tests__/score.test.ts
    ├── lib/
    │   ├── walk.ts                               # walkElements helper
    │   ├── window-config.ts                      # reads window.elementorAudits
    │   ├── attachment-ids.ts                     # extract attachment IDs from elements
    │   └── __tests__/
    │       ├── walk.test.ts
    │       └── attachment-ids.test.ts
    ├── api/
    │   ├── page-context-client.ts                # axios call to data/audits/page-context
    │   └── __tests__/page-context-client.test.ts
    ├── store/
    │   ├── index.ts
    │   ├── slice.ts
    │   └── selectors.ts
    ├── audits/                                   # one file per built-in evaluator
    │   ├── missing-page-title.ts
    │   ├── missing-excerpt.ts
    │   ├── missing-featured-image.ts
    │   ├── uses-sections-or-columns.ts
    │   ├── default-design-system.ts
    │   ├── heading-structure.ts
    │   ├── images-missing-alt.ts
    │   ├── images-too-large.ts
    │   ├── prefer-global-colors.ts
    │   ├── image-carousel-default-name.ts
    │   ├── nested-boxed-containers.ts
    │   ├── icon-widget-link-missing-aria-label.ts
    │   ├── register-built-ins.ts                 # calls registerAudit() for each
    │   └── __tests__/<one .test.ts per audit>
    ├── hooks/
    │   ├── use-audit-report.ts
    │   └── use-violation-focus.ts
    └── components/
        ├── audit-panel.tsx
        ├── audit-toolbar-toggle.tsx
        ├── states/
        │   ├── empty-state.tsx
        │   ├── loading-state.tsx
        │   └── error-state.tsx
        └── tabs/
            ├── score-tab.tsx
            ├── category-tab.tsx
            ├── score-gauge.tsx
            └── violation-row.tsx

tests/playwright/sanity/modules/audits/
└── audit-panel.test.ts
```

---

## Task 1: Scaffold the package

**Files:**
- Create: `packages/packages/core/editor-audits/package.json`
- Create: `packages/packages/core/editor-audits/CHANGELOG.md`
- Create: `packages/packages/core/editor-audits/README.md`
- Create: `packages/packages/core/editor-audits/src/index.ts`

- [x] **Step 1: Create the package.json**

```json
{
  "name": "@elementor/editor-audits",
  "version": "4.2.0",
  "private": false,
  "author": "Elementor Team",
  "homepage": "https://elementor.com/",
  "license": "GPL-3.0-or-later",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./package.json": "./package.json"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/elementor/elementor.git",
    "directory": "packages/core/editor-audits"
  },
  "bugs": { "url": "https://github.com/elementor/elementor/issues" },
  "publishConfig": { "access": "public" },
  "files": ["README.md", "CHANGELOG.md", "/dist", "/src", "!**/__tests__"],
  "scripts": {
    "build": "tsup --config=../../tsup.build.ts",
    "dev": "tsup --config=../../tsup.dev.ts"
  },
  "dependencies": {
    "@elementor/editor": "4.2.0",
    "@elementor/editor-app-bar": "4.2.0",
    "@elementor/editor-elements": "4.2.0",
    "@elementor/editor-floating-panels": "4.2.0",
    "@elementor/editor-v1-adapters": "4.2.0",
    "@elementor/http-client": "4.2.0",
    "@elementor/icons": "4.2.0",
    "@elementor/locations": "4.2.0",
    "@elementor/store": "4.2.0",
    "@elementor/ui": "1.37.5"
  },
  "peerDependencies": {
    "@wordpress/i18n": "^4.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "tsup": "^8.3.5"
  }
}
```

- [x] **Step 2: Create README.md + CHANGELOG.md + empty index**

`CHANGELOG.md`:

```md
# @elementor/editor-audits

## 4.2.0

- Initial release. On-demand page audit panel with 12 built-in audits.
```

`README.md`:

```md
# @elementor/editor-audits

User-facing audit feature for the Elementor editor. Renders inside a floating panel from `@elementor/editor-floating-panels`. See `docs/superpowers/specs/2026-05-28-editor-audit-panel-design.md`.
```

`src/index.ts`:

```ts
export {};
```

- [x] **Step 3: Workspace + build**

```bash
npm install
npm run build:packages
```

Expected: PASS, dist/ populated.

- [x] **Step 4: Lint**

```bash
cd packages && npx eslint packages/core/editor-audits --report-unused-disable-directives-severity error
```

Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add packages/packages/core/editor-audits
git commit -m "feat(editor-audits): scaffold package"
```

---

## Task 2: Public types + Audit base + registry

**Files:**
- Create: `src/types.ts`
- Create: `src/audit.ts`
- Create: `src/registry.ts`
- Create: `src/__tests__/registry.test.ts`

- [x] **Step 1: Write failing registry tests**

Create `src/__tests__/registry.test.ts`:

```ts
import { clearRegistry, getRegistered, hasEvaluator, registerAudit } from '../registry';
import { type AuditDescriptor } from '../types';

const descriptor: AuditDescriptor = {
    id: 'audits/test',
    title: 'Test',
    description: 'A test audit',
    fixHint: 'Fix it',
    categories: [ 'seo' ],
    severity: 'warning',
    weight: 5,
};

describe( 'audits registry', () => {
    beforeEach( () => clearRegistry() );

    it( 'registers an audit and exposes it', () => {
        // Act.
        registerAudit( descriptor, async () => ( { status: 'pass' } ) );

        // Assert.
        expect( getRegistered().map( ( r ) => r.descriptor.id ) ).toContain( 'audits/test' );
        expect( hasEvaluator( 'audits/test' ) ).toBe( true );
    } );

    it( 'reports missing evaluator', () => {
        expect( hasEvaluator( 'audits/missing' ) ).toBe( false );
    } );

    it( 'overwrites a previously registered audit with the same id', () => {
        // Arrange.
        const first = jest.fn< Promise< { status: 'pass' } >, [] >().mockResolvedValue( { status: 'pass' } );
        const second = jest.fn< Promise< { status: 'pass' } >, [] >().mockResolvedValue( { status: 'pass' } );

        registerAudit( descriptor, first );
        registerAudit( descriptor, second );

        const registered = getRegistered();
        expect( registered ).toHaveLength( 1 );
        expect( registered[ 0 ].evaluator ).toBe( second );
    } );
} );
```

- [x] **Step 2: Run (expect failure)**

```bash
cd packages && npx jest packages/core/editor-audits/src/__tests__/registry.test.ts
```

Expected: FAIL.

- [x] **Step 3: Implement types**

Create `src/types.ts`:

```ts
export type AuditCategory =
    | 'health'
    | 'seo'
    | 'accessibility'
    | 'performance'
    | 'best-practices';

export type AuditSeverity = 'error' | 'warning' | 'info';

export type AuditDescriptor = {
    id: string;
    title: string;
    description: string;
    fixHint: string;
    categories: AuditCategory[];
    severity: AuditSeverity;
    weight: number;
};

export type AuditViolation = {
    auditId: string;
    elementId?: string;
    targetHint?: 'page-settings' | 'site-settings' | 'element-settings';
    label: string;
    detail?: string;
};

export type AuditResult =
    | { status: 'pass' }
    | { status: 'fail'; violations: AuditViolation[] }
    | { status: 'skipped'; reason: string };

export type PageContextResponse = {
    post_title: string | null;
    post_excerpt: string | null;
    featured_image_id: number | null;
    image_sizes: Record< number, { width: number; height: number; filesize_bytes: number; mime: string; src: string } >;
    kit_id: number;
    kit_is_default_unchanged: boolean;
};

export type ElementSnapshotNode = {
    id: string;
    elType: string;
    widgetType?: string;
    settings: Record< string, unknown >;
    elements: ElementSnapshotNode[];
};

export type ElementsModelSnapshot = {
    documentId: number;
    tree: ElementSnapshotNode[];
};

export type KitSnapshot = {
    id: number;
    globals: {
        colors: Array< { id: string; value: string } >;
        fonts: Array< { id: string; value: string } >;
    };
};

export type AuditContext = {
    documentId: number;
    elements: ElementsModelSnapshot;
    pageContext: PageContextResponse;
    kit: KitSnapshot;
};

export type AuditEvaluator = ( ctx: AuditContext ) => AuditResult | Promise< AuditResult >;

export type PageAuditReport = {
    documentId: number;
    runAt: number;
    overall: number;
    categories: Record< AuditCategory, { score: number; failed: number; total: number } >;
    auditResults: Array< { descriptor: AuditDescriptor; result: AuditResult } >;
};
```

- [x] **Step 4: Implement Audit class**

Create `src/audit.ts`:

```ts
import { registerAudit } from './registry';
import { type AuditContext, type AuditDescriptor, type AuditResult } from './types';

export abstract class Audit {
    protected abstract descriptor(): AuditDescriptor;

    abstract evaluate( ctx: AuditContext ): AuditResult | Promise< AuditResult >;

    register(): void {
        registerAudit( this.descriptor(), ( ctx ) => this.evaluate( ctx ) );
    }
}
```

- [x] **Step 5: Implement registry**

Create `src/registry.ts`:

```ts
import { type AuditDescriptor, type AuditEvaluator } from './types';

type RegisteredAudit = {
    descriptor: AuditDescriptor;
    evaluator: AuditEvaluator;
};

const registry = new Map< string, RegisteredAudit >();

export function registerAudit( descriptor: AuditDescriptor, evaluator: AuditEvaluator ): void {
    registry.set( descriptor.id, { descriptor, evaluator } );
}

export function getRegistered(): RegisteredAudit[] {
    return Array.from( registry.values() );
}

export function hasEvaluator( id: string ): boolean {
    return registry.has( id );
}

export function clearRegistry(): void {
    registry.clear();
}
```

- [x] **Step 6: Run tests (expect pass)**

```bash
cd packages && npx jest packages/core/editor-audits/src/__tests__/registry.test.ts
```

Expected: PASS — 3 tests.

- [x] **Step 7: Commit**

```bash
git add packages/packages/core/editor-audits/src
git commit -m "feat(editor-audits): types + Audit base + registry"
```

---

## Task 3: walkElements helper

**Files:**
- Create: `src/lib/walk.ts`
- Create: `src/lib/__tests__/walk.test.ts`

- [x] **Step 1: Failing tests**

Create `src/lib/__tests__/walk.test.ts`:

```ts
import { type ElementSnapshotNode } from '../../types';
import { walkElements } from '../walk';

const tree: ElementSnapshotNode[] = [
    {
        id: 'root',
        elType: 'container',
        settings: { content_width: 'boxed' },
        elements: [
            {
                id: 'inner',
                elType: 'container',
                settings: { content_width: 'boxed' },
                elements: [
                    { id: 'h1', elType: 'widget', widgetType: 'heading', settings: { level: 'h1' }, elements: [] },
                ],
            },
            { id: 'img', elType: 'widget', widgetType: 'image', settings: { alt: '' }, elements: [] },
        ],
    },
];

describe( 'walkElements', () => {
    it( 'visits every node depth-first', () => {
        // Arrange.
        const ids: string[] = [];

        // Act.
        walkElements( tree, ( node ) => {
            ids.push( node.id );
        } );

        // Assert.
        expect( ids ).toEqual( [ 'root', 'inner', 'h1', 'img' ] );
    } );

    it( 'collects nodes matching a predicate via the returned array', () => {
        // Arrange.
        const matches: ElementSnapshotNode[] = [];

        // Act.
        walkElements( tree, ( node ) => {
            if ( node.elType === 'widget' && node.widgetType === 'heading' ) {
                matches.push( node );
            }
        } );

        // Assert.
        expect( matches.map( ( n ) => n.id ) ).toEqual( [ 'h1' ] );
    } );

    it( 'exposes the parent chain to the visitor', () => {
        // Arrange.
        const parentIdsFor: Record< string, string[] > = {};

        // Act.
        walkElements( tree, ( node, parents ) => {
            parentIdsFor[ node.id ] = parents.map( ( p ) => p.id );
        } );

        // Assert.
        expect( parentIdsFor.h1 ).toEqual( [ 'root', 'inner' ] );
        expect( parentIdsFor.root ).toEqual( [] );
    } );
} );
```

- [x] **Step 2: Run (expect failure)**

```bash
cd packages && npx jest packages/core/editor-audits/src/lib/__tests__/walk.test.ts
```

Expected: FAIL.

- [x] **Step 3: Implement walk**

Create `src/lib/walk.ts`:

```ts
import { type ElementSnapshotNode } from '../types';

export type WalkVisitor = ( node: ElementSnapshotNode, parents: ElementSnapshotNode[] ) => void;

export function walkElements( tree: ElementSnapshotNode[], visit: WalkVisitor ): void {
    const stack: Array< { node: ElementSnapshotNode; parents: ElementSnapshotNode[] } > = tree.map(
        ( node ) => ( { node, parents: [] } )
    );

    while ( stack.length > 0 ) {
        const { node, parents } = stack.shift()!;
        visit( node, parents );

        const childParents = [ ...parents, node ];
        for ( let i = node.elements.length - 1; i >= 0; i-- ) {
            stack.unshift( { node: node.elements[ i ], parents: childParents } );
        }
    }
}
```

- [x] **Step 4: Run (expect pass)**

```bash
cd packages && npx jest packages/core/editor-audits/src/lib/__tests__/walk.test.ts
```

Expected: PASS — 3 tests.

- [x] **Step 5: Commit**

```bash
git add packages/packages/core/editor-audits/src/lib
git commit -m "feat(editor-audits): walkElements helper"
```

---

## Task 4: Score engine

**Files:**
- Create: `src/score/score.ts`
- Create: `src/score/__tests__/score.test.ts`

- [x] **Step 1: Failing score tests**

Create `src/score/__tests__/score.test.ts`:

```ts
import { type AuditDescriptor, type AuditResult } from '../../types';
import { computeReport } from '../score';

function descriptor( id: string, categories: AuditDescriptor[ 'categories' ], weight = 10 ): AuditDescriptor {
    return {
        id,
        title: id,
        description: '',
        fixHint: '',
        categories,
        severity: 'warning',
        weight,
    };
}

describe( 'computeReport', () => {
    it( 'per-category score = passed weight / total weight × 100', () => {
        // Arrange.
        const results: Array< { descriptor: AuditDescriptor; result: AuditResult } > = [
            { descriptor: descriptor( 'a', [ 'seo' ], 10 ), result: { status: 'pass' } },
            { descriptor: descriptor( 'b', [ 'seo' ], 10 ), result: { status: 'fail', violations: [] } },
        ];

        // Act.
        const report = computeReport( 1, results );

        // Assert.
        expect( report.categories.seo.score ).toBe( 50 );
        expect( report.categories.seo.failed ).toBe( 1 );
        expect( report.categories.seo.total ).toBe( 2 );
    } );

    it( 'overall = mean of populated category scores', () => {
        // Arrange.
        const results: Array< { descriptor: AuditDescriptor; result: AuditResult } > = [
            { descriptor: descriptor( 'a', [ 'seo' ], 10 ), result: { status: 'pass' } },
            { descriptor: descriptor( 'b', [ 'performance' ], 10 ), result: { status: 'fail', violations: [] } },
        ];

        // Act.
        const report = computeReport( 1, results );

        // Assert.
        expect( report.overall ).toBe( 50 ); // (100 + 0) / 2
    } );

    it( 'skipped audits are excluded from totals', () => {
        // Arrange.
        const results: Array< { descriptor: AuditDescriptor; result: AuditResult } > = [
            { descriptor: descriptor( 'a', [ 'seo' ], 10 ), result: { status: 'pass' } },
            {
                descriptor: descriptor( 'b', [ 'seo' ], 10 ),
                result: { status: 'skipped', reason: 'evaluator-not-registered' },
            },
        ];

        // Act.
        const report = computeReport( 1, results );

        // Assert.
        expect( report.categories.seo.total ).toBe( 1 );
        expect( report.categories.seo.score ).toBe( 100 );
    } );

    it( 'returns 100 for a category with all passes', () => {
        const results: Array< { descriptor: AuditDescriptor; result: AuditResult } > = [
            { descriptor: descriptor( 'a', [ 'accessibility' ], 5 ), result: { status: 'pass' } },
        ];
        expect( computeReport( 1, results ).categories.accessibility.score ).toBe( 100 );
    } );

    it( 'returns 0 for a category with all fails', () => {
        const results: Array< { descriptor: AuditDescriptor; result: AuditResult } > = [
            { descriptor: descriptor( 'a', [ 'accessibility' ], 5 ), result: { status: 'fail', violations: [] } },
        ];
        expect( computeReport( 1, results ).categories.accessibility.score ).toBe( 0 );
    } );

    it( 'audit weight matters in score', () => {
        const results: Array< { descriptor: AuditDescriptor; result: AuditResult } > = [
            { descriptor: descriptor( 'a', [ 'seo' ], 9 ), result: { status: 'pass' } },
            { descriptor: descriptor( 'b', [ 'seo' ], 1 ), result: { status: 'fail', violations: [] } },
        ];

        expect( computeReport( 1, results ).categories.seo.score ).toBe( 90 );
    } );
} );
```

- [x] **Step 2: Run (expect failure)**

```bash
cd packages && npx jest packages/core/editor-audits/src/score/__tests__/score.test.ts
```

Expected: FAIL.

- [x] **Step 3: Implement score engine**

Create `src/score/score.ts`:

```ts
import { type AuditCategory, type AuditDescriptor, type AuditResult, type PageAuditReport } from '../types';

const ALL_CATEGORIES: AuditCategory[] = [ 'health', 'seo', 'accessibility', 'performance', 'best-practices' ];

type Input = Array< { descriptor: AuditDescriptor; result: AuditResult } >;

export function computeReport( documentId: number, results: Input ): PageAuditReport {
    const categories = ALL_CATEGORIES.reduce(
        ( acc, category ) => {
            acc[ category ] = { score: 0, failed: 0, total: 0 };
            return acc;
        },
        {} as PageAuditReport[ 'categories' ]
    );

    const counted = results.filter( ( r ) => r.result.status !== 'skipped' );

    for ( const category of ALL_CATEGORIES ) {
        const inCategory = counted.filter( ( r ) => r.descriptor.categories.includes( category ) );
        const totalWeight = inCategory.reduce( ( sum, r ) => sum + r.descriptor.weight, 0 );
        const passedWeight = inCategory
            .filter( ( r ) => r.result.status === 'pass' )
            .reduce( ( sum, r ) => sum + r.descriptor.weight, 0 );
        const failedCount = inCategory.filter( ( r ) => r.result.status === 'fail' ).length;

        categories[ category ].total = inCategory.length;
        categories[ category ].failed = failedCount;
        categories[ category ].score = totalWeight === 0 ? 0 : Math.round( ( passedWeight / totalWeight ) * 100 );
    }

    const populated = ALL_CATEGORIES.filter( ( c ) => categories[ c ].total > 0 );
    const overall =
        populated.length === 0
            ? 0
            : Math.round( populated.reduce( ( sum, c ) => sum + categories[ c ].score, 0 ) / populated.length );

    return {
        documentId,
        runAt: Date.now(),
        overall,
        categories,
        auditResults: results,
    };
}
```

- [x] **Step 4: Run (expect pass)**

```bash
cd packages && npx jest packages/core/editor-audits/src/score/__tests__/score.test.ts
```

Expected: PASS — 6 tests.

- [x] **Step 5: Commit**

```bash
git add packages/packages/core/editor-audits/src/score
git commit -m "feat(editor-audits): Lighthouse-style score engine"
```

---

## Task 5: Page-context client

**Files:**
- Create: `src/api/page-context-client.ts`
- Create: `src/api/__tests__/page-context-client.test.ts`
- Create: `src/lib/window-config.ts`
- Create: `src/lib/attachment-ids.ts`
- Create: `src/lib/__tests__/attachment-ids.test.ts`

- [x] **Step 1: Failing attachment-ids tests**

Create `src/lib/__tests__/attachment-ids.test.ts`:

```ts
import { extractAttachmentIds } from '../attachment-ids';
import { type ElementSnapshotNode } from '../../types';

const tree: ElementSnapshotNode[] = [
    {
        id: 'a',
        elType: 'widget',
        widgetType: 'image',
        settings: { image: { id: 11, url: 'http://example.test/a.jpg' } },
        elements: [],
    },
    {
        id: 'b',
        elType: 'widget',
        widgetType: 'image-carousel',
        settings: {
            carousel: [
                { id: 12, url: '...' },
                { id: 13, url: '...' },
            ],
        },
        elements: [],
    },
    {
        id: 'c',
        elType: 'widget',
        widgetType: 'image',
        settings: { image: { url: 'http://example.test/external.jpg' } },
        elements: [],
    },
];

describe( 'extractAttachmentIds', () => {
    it( 'collects attachment IDs from image and image-carousel widgets', () => {
        expect( extractAttachmentIds( tree ).sort() ).toEqual( [ 11, 12, 13 ] );
    } );

    it( 'returns a unique sorted list', () => {
        const duplicated: ElementSnapshotNode[] = [
            { id: '1', elType: 'widget', widgetType: 'image', settings: { image: { id: 5 } }, elements: [] },
            { id: '2', elType: 'widget', widgetType: 'image', settings: { image: { id: 5 } }, elements: [] },
        ];
        expect( extractAttachmentIds( duplicated ) ).toEqual( [ 5 ] );
    } );

    it( 'ignores widgets without attachment IDs', () => {
        expect( extractAttachmentIds( [ tree[ 2 ] ] ) ).toEqual( [] );
    } );
} );
```

- [x] **Step 2: Implement attachment-ids**

Create `src/lib/attachment-ids.ts`:

```ts
import { type ElementSnapshotNode } from '../types';
import { walkElements } from './walk';

const IMAGE_LIKE_WIDGETS = new Set( [ 'image', 'image-box', 'image-carousel', 'gallery', 'image-gallery' ] );

export function extractAttachmentIds( tree: ElementSnapshotNode[] ): number[] {
    const ids = new Set< number >();

    walkElements( tree, ( node ) => {
        if ( node.elType !== 'widget' ) {
            return;
        }
        if ( ! IMAGE_LIKE_WIDGETS.has( node.widgetType ?? '' ) ) {
            return;
        }

        const image = node.settings.image as { id?: number } | undefined;
        if ( image?.id ) {
            ids.add( image.id );
        }

        const carousel = ( node.settings.carousel ?? node.settings.gallery ) as Array< { id?: number } > | undefined;
        if ( Array.isArray( carousel ) ) {
            for ( const item of carousel ) {
                if ( item?.id ) {
                    ids.add( item.id );
                }
            }
        }
    } );

    return Array.from( ids ).sort( ( a, b ) => a - b );
}
```

- [x] **Step 3: Run tests**

```bash
cd packages && npx jest packages/core/editor-audits/src/lib/__tests__/attachment-ids.test.ts
```

Expected: PASS — 3 tests.

- [x] **Step 4: Failing page-context-client tests**

Create `src/api/__tests__/page-context-client.test.ts`:

```ts
import { fetchPageContext } from '../page-context-client';
import { httpService } from '@elementor/http-client';

jest.mock( '@elementor/http-client', () => ( {
    httpService: jest.fn(),
} ) );

describe( 'fetchPageContext', () => {
    beforeEach( () => {
        ( window as unknown as { elementorAudits: unknown } ).elementorAudits = {
            audits: [],
            restNamespace: 'elementor/v1',
            nonce: 'fake-nonce',
        };
    } );

    it( 'calls the REST endpoint with the right URL, document id, and attachment ids', async () => {
        // Arrange.
        const mockHttp = jest.mocked( httpService );
        const get = jest.fn().mockResolvedValue( { data: { post_title: 'X' } } );
        mockHttp.mockReturnValue( { get } as unknown as ReturnType< typeof httpService > );

        // Act.
        await fetchPageContext( 42, [ 1, 2 ] );

        // Assert.
        expect( get ).toHaveBeenCalledWith(
            expect.stringContaining( '/elementor/v1/audits/page-context' ),
            expect.objectContaining( {
                params: expect.objectContaining( { document_id: 42 } ),
            } )
        );
    } );

    it( 'returns the response body', async () => {
        const mockHttp = jest.mocked( httpService );
        const expected = { post_title: 'Hello' };
        mockHttp.mockReturnValue( {
            get: jest.fn().mockResolvedValue( { data: expected } ),
        } as unknown as ReturnType< typeof httpService > );

        const result = await fetchPageContext( 1, [] );
        expect( result ).toEqual( expected );
    } );
} );
```

- [x] **Step 5: Implement window-config + page-context-client**

Create `src/lib/window-config.ts`:

```ts
import { type AuditDescriptor } from '../types';

type WindowConfig = {
    audits: AuditDescriptor[];
    restNamespace: string;
    nonce: string;
};

declare global {
    interface Window {
        elementorAudits?: WindowConfig;
    }
}

export function getWindowConfig(): WindowConfig {
    const config = window.elementorAudits;
    if ( ! config ) {
        return { audits: [], restNamespace: 'elementor/v1', nonce: '' };
    }
    return config;
}
```

Create `src/api/page-context-client.ts`:

```ts
import { httpService } from '@elementor/http-client';

import { getWindowConfig } from '../lib/window-config';
import { type PageContextResponse } from '../types';

export async function fetchPageContext(
    documentId: number,
    attachmentIds: number[]
): Promise< PageContextResponse > {
    const { restNamespace, nonce } = getWindowConfig();
    const url = `/wp-json/${ restNamespace }/audits/page-context`;

    const response = await httpService().get< PageContextResponse >( url, {
        params: {
            document_id: documentId,
            attachment_ids: attachmentIds,
        },
        headers: { 'X-WP-Nonce': nonce },
    } );

    return response.data;
}
```

- [x] **Step 6: Run tests (expect pass)**

```bash
cd packages && npx jest packages/core/editor-audits/src/api
```

Expected: PASS — 2 tests.

- [x] **Step 7: Commit**

```bash
git add packages/packages/core/editor-audits/src
git commit -m "feat(editor-audits): page-context HTTP client + attachment-id extractor"
```

---

## Task 6: Store slice

**Files:**
- Create: `src/store/slice.ts`
- Create: `src/store/selectors.ts`
- Create: `src/store/index.ts`

- [x] **Step 1: Implement slice**

Create `src/store/slice.ts`:

```ts
import { __createSlice, type PayloadAction } from '@elementor/store';

import { type PageAuditReport } from '../types';

type SliceState = {
    status: 'idle' | 'loading' | 'error' | 'ready';
    report: PageAuditReport | null;
    error: string | null;
};

const initialState: SliceState = { status: 'idle', report: null, error: null };

export const slice = __createSlice( {
    name: 'audits',
    initialState,
    reducers: {
        runStarted( state ) {
            state.status = 'loading';
            state.error = null;
        },
        runSucceeded( state, action: PayloadAction< PageAuditReport > ) {
            state.status = 'ready';
            state.report = action.payload;
        },
        runFailed( state, action: PayloadAction< string > ) {
            state.status = 'error';
            state.error = action.payload;
        },
        reset( state ) {
            state.status = 'idle';
            state.error = null;
        },
    },
} );

export type AuditsSliceState = SliceState;
```

- [x] **Step 2: Implement selectors**

Create `src/store/selectors.ts`:

```ts
import { type AuditsSliceState } from './slice';

type GlobalState = { audits: AuditsSliceState };

export function selectStatus( state: GlobalState ) {
    return state.audits.status;
}

export function selectReport( state: GlobalState ) {
    return state.audits.report;
}

export function selectError( state: GlobalState ) {
    return state.audits.error;
}
```

- [x] **Step 3: Store barrel**

Create `src/store/index.ts`:

```ts
export { slice } from './slice';
export * from './selectors';
```

- [x] **Step 4: Commit**

```bash
git add packages/packages/core/editor-audits/src/store
git commit -m "feat(editor-audits): store slice + selectors"
```

---

## Task 7: Runner

**Files:**
- Create: `src/runner.ts`
- Create: `src/__tests__/runner.test.ts`

- [x] **Step 1: Failing runner tests**

Create `src/__tests__/runner.test.ts`:

```ts
import { clearRegistry, registerAudit } from '../registry';
import { runPageAudit } from '../runner';
import { type AuditContext, type AuditResult, type PageContextResponse } from '../types';

jest.mock( '../api/page-context-client', () => ( {
    fetchPageContext: jest.fn(),
} ) );

jest.mock( '@elementor/editor-elements', () => ( {
    getElements: jest.fn(),
    getCurrentDocumentId: jest.fn(),
} ) );

const fetchMock = require( '../api/page-context-client' ).fetchPageContext as jest.Mock;
const getElements = require( '@elementor/editor-elements' ).getElements as jest.Mock;

const FAKE_PAGE_CONTEXT: PageContextResponse = {
    post_title: 'X',
    post_excerpt: null,
    featured_image_id: null,
    image_sizes: {},
    kit_id: 0,
    kit_is_default_unchanged: false,
};

describe( 'runPageAudit', () => {
    beforeEach( () => {
        clearRegistry();
        fetchMock.mockResolvedValue( FAKE_PAGE_CONTEXT );
        getElements.mockReturnValue( [] );
    } );

    it( 'runs every registered evaluator and computes a report', async () => {
        // Arrange.
        registerAudit(
            { id: 'a', title: 'a', description: '', fixHint: '', categories: [ 'seo' ], severity: 'warning', weight: 10 },
            async (): Promise< AuditResult > => ( { status: 'pass' } )
        );

        // Act.
        const report = await runPageAudit( 1 );

        // Assert.
        expect( report.auditResults ).toHaveLength( 1 );
        expect( report.auditResults[ 0 ].result ).toEqual( { status: 'pass' } );
        expect( report.overall ).toBe( 100 );
    } );

    it( 'skips audits whose evaluator throws and reports a skipped reason', async () => {
        // Arrange.
        registerAudit(
            { id: 'b', title: 'b', description: '', fixHint: '', categories: [ 'seo' ], severity: 'warning', weight: 10 },
            (): AuditResult => {
                throw new Error( 'boom' );
            }
        );

        // Act.
        const report = await runPageAudit( 1 );

        // Assert.
        expect( report.auditResults[ 0 ].result ).toMatchObject( { status: 'skipped' } );
    } );

    it( 'isolates failing audits from successful ones', async () => {
        registerAudit(
            { id: 'good', title: '', description: '', fixHint: '', categories: [ 'seo' ], severity: 'warning', weight: 5 },
            async (): Promise< AuditResult > => ( { status: 'pass' } )
        );
        registerAudit(
            { id: 'bad', title: '', description: '', fixHint: '', categories: [ 'seo' ], severity: 'warning', weight: 5 },
            (): AuditResult => {
                throw new Error( 'boom' );
            }
        );

        const report = await runPageAudit( 1 );

        const byId = Object.fromEntries( report.auditResults.map( ( r ) => [ r.descriptor.id, r.result.status ] ) );
        expect( byId.good ).toBe( 'pass' );
        expect( byId.bad ).toBe( 'skipped' );
    } );
} );
```

- [x] **Step 2: Implement runner**

Create `src/runner.ts`:

```ts
import { getElements } from '@elementor/editor-elements';

import { fetchPageContext } from './api/page-context-client';
import { extractAttachmentIds } from './lib/attachment-ids';
import { getRegistered } from './registry';
import { computeReport } from './score/score';
import {
    type AuditContext,
    type AuditResult,
    type ElementsModelSnapshot,
    type KitSnapshot,
    type PageAuditReport,
} from './types';

export async function runPageAudit( documentId: number ): Promise< PageAuditReport > {
    const tree = ( getElements() ?? [] ) as ElementsModelSnapshot[ 'tree' ];
    const attachmentIds = extractAttachmentIds( tree );
    const pageContext = await fetchPageContext( documentId, attachmentIds );

    const elements: ElementsModelSnapshot = { documentId, tree };
    const kit: KitSnapshot = readKitFromGlobals( pageContext.kit_id );

    const ctx: AuditContext = { documentId, elements, pageContext, kit };
    const registered = getRegistered();

    const auditResults: Array< { descriptor: ( typeof registered )[ number ][ 'descriptor' ]; result: AuditResult } > = [];

    for ( const { descriptor, evaluator } of registered ) {
        try {
            const result = await Promise.resolve( evaluator( ctx ) );
            auditResults.push( { descriptor, result } );
        } catch ( error ) {
            auditResults.push( {
                descriptor,
                result: { status: 'skipped', reason: error instanceof Error ? error.message : 'unknown-error' },
            } );
        }
    }

    return computeReport( documentId, auditResults );
}

function readKitFromGlobals( kitId: number ): KitSnapshot {
    type ExtendedWindow = Window & {
        elementor?: {
            config?: {
                kit?: {
                    system_colors?: Array< { _id: string; color: string } >;
                    custom_colors?: Array< { _id: string; color: string } >;
                    system_typography?: Array< { _id: string; title: string } >;
                    custom_typography?: Array< { _id: string; title: string } >;
                };
            };
        };
    };
    const kit = ( window as unknown as ExtendedWindow ).elementor?.config?.kit ?? {};
    const colors = [ ...( kit.system_colors ?? [] ), ...( kit.custom_colors ?? [] ) ].map( ( c ) => ( {
        id: c._id,
        value: c.color,
    } ) );
    const fonts = [ ...( kit.system_typography ?? [] ), ...( kit.custom_typography ?? [] ) ].map( ( f ) => ( {
        id: f._id,
        value: f.title,
    } ) );
    return { id: kitId, globals: { colors, fonts } };
}
```

- [x] **Step 3: Run tests (expect pass)**

```bash
cd packages && npx jest packages/core/editor-audits/src/__tests__/runner.test.ts
```

Expected: PASS — 3 tests.

- [x] **Step 4: Commit**

```bash
git add packages/packages/core/editor-audits/src
git commit -m "feat(editor-audits): runner builds context + runs evaluators + computes report"
```

---

## Task 8: The 12 audit evaluators

All 12 evaluators go in one task because each is small and the structure is identical. For each: write a focused test, then write the evaluator, then run + commit at the end. The full code follows.

**Files:**
- Create: 12 evaluator files + 12 test files
- Create: `src/audits/register-built-ins.ts`

For brevity in this plan, the steps are grouped: write all 12 tests first, then all 12 evaluators. The engineer should still TDD them one-by-one in the editor.

- [x] **Step 1: missing-page-title**

Test `src/audits/__tests__/missing-page-title.test.ts`:

```ts
import { evaluator, descriptor } from '../missing-page-title';
import { type AuditContext } from '../../types';

const ctx = ( title: string | null ): AuditContext => ( {
    documentId: 1,
    elements: { documentId: 1, tree: [] },
    kit: { id: 0, globals: { colors: [], fonts: [] } },
    pageContext: { post_title: title, post_excerpt: null, featured_image_id: null, image_sizes: {}, kit_id: 0, kit_is_default_unchanged: false },
} );

describe( descriptor.id, () => {
    it( 'passes when title is non-empty', async () => {
        expect( await evaluator( ctx( 'Hello' ) ) ).toEqual( { status: 'pass' } );
    } );
    it( 'fails when title is null', async () => {
        const result = await evaluator( ctx( null ) );
        expect( result.status ).toBe( 'fail' );
    } );
} );
```

Impl `src/audits/missing-page-title.ts`:

```ts
import { __ } from '@wordpress/i18n';

import { type AuditDescriptor, type AuditEvaluator } from '../types';

export const descriptor: AuditDescriptor = {
    id: 'audits/missing-page-title',
    title: __( 'Missing page title', 'elementor' ),
    description: __( 'Pages need a clear title for SEO and screen-reader navigation.', 'elementor' ),
    fixHint: __( 'Open Page Settings and add a title.', 'elementor' ),
    categories: [ 'seo', 'accessibility' ],
    severity: 'error',
    weight: 10,
};

export const evaluator: AuditEvaluator = ( ctx ) => {
    if ( ctx.pageContext.post_title ) {
        return { status: 'pass' };
    }
    return {
        status: 'fail',
        violations: [
            {
                auditId: descriptor.id,
                label: __( 'Page has no title.', 'elementor' ),
                targetHint: 'page-settings',
            },
        ],
    };
};
```

- [x] **Step 2: missing-excerpt**

Test (same shape as Step 1, asserting on `post_excerpt`). Impl `src/audits/missing-excerpt.ts`:

```ts
import { __ } from '@wordpress/i18n';
import { type AuditDescriptor, type AuditEvaluator } from '../types';

export const descriptor: AuditDescriptor = {
    id: 'audits/missing-excerpt',
    title: __( 'Missing page excerpt', 'elementor' ),
    description: __( 'A descriptive excerpt helps search engines and previews summarize the page.', 'elementor' ),
    fixHint: __( 'Open Page Settings and write a short excerpt.', 'elementor' ),
    categories: [ 'seo', 'accessibility' ],
    severity: 'warning',
    weight: 5,
};

export const evaluator: AuditEvaluator = ( ctx ) =>
    ctx.pageContext.post_excerpt
        ? { status: 'pass' }
        : {
              status: 'fail',
              violations: [
                  { auditId: descriptor.id, label: __( 'Page has no excerpt.', 'elementor' ), targetHint: 'page-settings' },
              ],
          };
```

- [x] **Step 3: missing-featured-image**

Test asserts on `featured_image_id`. Impl `src/audits/missing-featured-image.ts`:

```ts
import { __ } from '@wordpress/i18n';
import { type AuditDescriptor, type AuditEvaluator } from '../types';

export const descriptor: AuditDescriptor = {
    id: 'audits/missing-featured-image',
    title: __( 'Missing featured image', 'elementor' ),
    description: __( 'Featured images are used by social shares and many themes for hero visuals.', 'elementor' ),
    fixHint: __( 'Open Page Settings and set a featured image.', 'elementor' ),
    categories: [ 'seo' ],
    severity: 'warning',
    weight: 5,
};

export const evaluator: AuditEvaluator = ( ctx ) =>
    ctx.pageContext.featured_image_id
        ? { status: 'pass' }
        : {
              status: 'fail',
              violations: [
                  { auditId: descriptor.id, label: __( 'No featured image set.', 'elementor' ), targetHint: 'page-settings' },
              ],
          };
```

- [x] **Step 4: uses-sections-or-columns**

Test seeds a tree with a `section` and asserts a violation. Impl `src/audits/uses-sections-or-columns.ts`:

```ts
import { __ } from '@wordpress/i18n';
import { walkElements } from '../lib/walk';
import { type AuditDescriptor, type AuditEvaluator, type AuditViolation } from '../types';

export const descriptor: AuditDescriptor = {
    id: 'audits/uses-sections-or-columns',
    title: __( 'Uses outdated sections or columns', 'elementor' ),
    description: __( 'Sections and columns are legacy elements. Containers render fewer DOM nodes and are more flexible.', 'elementor' ),
    fixHint: __( 'Use the Container Converter to replace each section/column with a container.', 'elementor' ),
    categories: [ 'health', 'performance' ],
    severity: 'warning',
    weight: 7,
};

export const evaluator: AuditEvaluator = ( ctx ) => {
    const violations: AuditViolation[] = [];
    walkElements( ctx.elements.tree, ( node ) => {
        if ( node.elType === 'section' || node.elType === 'column' ) {
            violations.push( {
                auditId: descriptor.id,
                elementId: node.id,
                label: node.elType === 'section' ? __( 'Section element', 'elementor' ) : __( 'Column element', 'elementor' ),
            } );
        }
    } );
    return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
};
```

- [x] **Step 5: default-design-system**

Test asserts on `kit_is_default_unchanged`. Impl `src/audits/default-design-system.ts`:

```ts
import { __ } from '@wordpress/i18n';
import { type AuditDescriptor, type AuditEvaluator } from '../types';

export const descriptor: AuditDescriptor = {
    id: 'audits/default-design-system',
    title: __( 'Default website kit is in use', 'elementor' ),
    description: __( 'Your site is using the default design system colors and fonts. Custom branding makes the site feel uniquely yours.', 'elementor' ),
    fixHint: __( 'Open Site Settings and customize your kit (colors, fonts, layout).', 'elementor' ),
    categories: [ 'health', 'best-practices' ],
    severity: 'info',
    weight: 3,
};

export const evaluator: AuditEvaluator = ( ctx ) =>
    ctx.pageContext.kit_is_default_unchanged
        ? {
              status: 'fail',
              violations: [
                  { auditId: descriptor.id, label: __( 'Kit appears unchanged from default.', 'elementor' ), targetHint: 'site-settings' },
              ],
          }
        : { status: 'pass' };
```

- [x] **Step 6: heading-structure**

Test seeds an elements tree with mis-ordered headings; impl `src/audits/heading-structure.ts`:

```ts
import { __ } from '@wordpress/i18n';
import { walkElements } from '../lib/walk';
import { type AuditDescriptor, type AuditEvaluator, type AuditViolation } from '../types';

export const descriptor: AuditDescriptor = {
    id: 'audits/heading-structure',
    title: __( 'Heading structure', 'elementor' ),
    description: __( 'Pages should have exactly one H1 and a non-skipping heading order.', 'elementor' ),
    fixHint: __( 'Ensure your page has one H1 and that heading levels do not skip (no H2 → H4).', 'elementor' ),
    categories: [ 'seo', 'accessibility' ],
    severity: 'error',
    weight: 10,
};

const HEADING_WIDGETS = new Set( [ 'heading', 'text-editor-heading' ] );
const LEVELS = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ] as const;

export const evaluator: AuditEvaluator = ( ctx ) => {
    const headings: Array< { id: string; level: number } > = [];
    walkElements( ctx.elements.tree, ( node ) => {
        if ( node.elType === 'widget' && HEADING_WIDGETS.has( node.widgetType ?? '' ) ) {
            const raw = ( node.settings.header_size ?? node.settings.level ?? 'h2' ) as string;
            const idx = LEVELS.indexOf( raw.toLowerCase() as ( typeof LEVELS )[ number ] );
            if ( idx >= 0 ) {
                headings.push( { id: node.id, level: idx + 1 } );
            }
        }
    } );

    const violations: AuditViolation[] = [];

    if ( headings.length === 0 ) {
        violations.push( { auditId: descriptor.id, label: __( 'No headings found on the page.', 'elementor' ) } );
    } else {
        const h1Count = headings.filter( ( h ) => h.level === 1 ).length;
        if ( h1Count === 0 ) {
            violations.push( { auditId: descriptor.id, label: __( 'No H1 on the page.', 'elementor' ) } );
        }
        if ( h1Count > 1 ) {
            headings
                .filter( ( h ) => h.level === 1 )
                .slice( 1 )
                .forEach( ( h ) =>
                    violations.push( {
                        auditId: descriptor.id,
                        elementId: h.id,
                        targetHint: 'element-settings',
                        label: __( 'Extra H1 — only one H1 per page.', 'elementor' ),
                    } )
                );
        }
        for ( let i = 1; i < headings.length; i++ ) {
            if ( headings[ i ].level - headings[ i - 1 ].level > 1 ) {
                violations.push( {
                    auditId: descriptor.id,
                    elementId: headings[ i ].id,
                    targetHint: 'element-settings',
                    label: __( 'Heading level skipped.', 'elementor' ),
                } );
            }
        }
    }

    return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
};
```

- [x] **Step 7: images-missing-alt**

Test seeds an image without alt. Impl `src/audits/images-missing-alt.ts`:

```ts
import { __ } from '@wordpress/i18n';
import { walkElements } from '../lib/walk';
import { type AuditDescriptor, type AuditEvaluator, type AuditViolation } from '../types';

export const descriptor: AuditDescriptor = {
    id: 'audits/images-missing-alt',
    title: __( 'Images missing alt text', 'elementor' ),
    description: __( 'Every image needs a meaningful alt attribute for screen readers and image-search.', 'elementor' ),
    fixHint: __( 'Open the image\'s settings and add an Alt Text describing the image.', 'elementor' ),
    categories: [ 'seo', 'accessibility' ],
    severity: 'error',
    weight: 10,
};

export const evaluator: AuditEvaluator = ( ctx ) => {
    const violations: AuditViolation[] = [];
    walkElements( ctx.elements.tree, ( node ) => {
        if ( node.elType !== 'widget' || node.widgetType !== 'image' ) {
            return;
        }
        const image = node.settings.image as { alt?: string } | undefined;
        if ( ! image?.alt ) {
            violations.push( {
                auditId: descriptor.id,
                elementId: node.id,
                targetHint: 'element-settings',
                label: __( 'Image is missing alt text.', 'elementor' ),
            } );
        }
    } );
    return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
};
```

- [x] **Step 8: images-too-large**

Test seeds `image_sizes` over the 500 KB threshold. Impl `src/audits/images-too-large.ts`:

```ts
import { __, sprintf } from '@wordpress/i18n';
import { walkElements } from '../lib/walk';
import { type AuditDescriptor, type AuditEvaluator, type AuditViolation } from '../types';

const SIZE_THRESHOLD_BYTES = 500 * 1024;

export const descriptor: AuditDescriptor = {
    id: 'audits/images-too-large',
    title: __( 'Oversized images', 'elementor' ),
    description: __( 'Large image files slow down the page.', 'elementor' ),
    fixHint: __( 'Replace the image with a smaller version or enable image optimization.', 'elementor' ),
    categories: [ 'performance' ],
    severity: 'warning',
    weight: 7,
};

export const evaluator: AuditEvaluator = ( ctx ) => {
    const violations: AuditViolation[] = [];
    walkElements( ctx.elements.tree, ( node ) => {
        if ( node.elType !== 'widget' || node.widgetType !== 'image' ) {
            return;
        }
        const image = node.settings.image as { id?: number } | undefined;
        const id = image?.id;
        if ( ! id ) {
            return;
        }
        const size = ctx.pageContext.image_sizes[ id ];
        if ( size && size.filesize_bytes > SIZE_THRESHOLD_BYTES ) {
            violations.push( {
                auditId: descriptor.id,
                elementId: node.id,
                targetHint: 'element-settings',
                label: sprintf( __( 'Image is %d KB (over 500 KB).', 'elementor' ), Math.round( size.filesize_bytes / 1024 ) ),
            } );
        }
    } );
    return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
};
```

- [x] **Step 9: prefer-global-colors**

Test seeds a widget with a raw hex `#ff0000` and asserts a violation only when the kit has globals. Impl `src/audits/prefer-global-colors.ts`:

```ts
import { __ } from '@wordpress/i18n';
import { walkElements } from '../lib/walk';
import { type AuditDescriptor, type AuditEvaluator, type AuditViolation } from '../types';

const HEX_RE = /^#[0-9a-f]{3,8}$/i;

export const descriptor: AuditDescriptor = {
    id: 'audits/prefer-global-colors',
    title: __( 'Prefer global colors over hard-coded values', 'elementor' ),
    description: __( 'Global colors make the design consistent and easy to update site-wide.', 'elementor' ),
    fixHint: __( 'Replace the hard-coded color with one of your kit\'s global colors.', 'elementor' ),
    categories: [ 'health', 'best-practices' ],
    severity: 'info',
    weight: 3,
};

export const evaluator: AuditEvaluator = ( ctx ) => {
    if ( ctx.kit.globals.colors.length === 0 ) {
        return { status: 'skipped', reason: 'no-kit-globals' };
    }
    const violations: AuditViolation[] = [];
    walkElements( ctx.elements.tree, ( node ) => {
        if ( node.elType !== 'widget' ) {
            return;
        }
        for ( const [ key, value ] of Object.entries( node.settings ) ) {
            if ( typeof value === 'string' && HEX_RE.test( value ) ) {
                violations.push( {
                    auditId: descriptor.id,
                    elementId: node.id,
                    targetHint: 'element-settings',
                    label: `${ key }: ${ value }`,
                } );
            }
        }
    } );
    return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
};
```

- [x] **Step 10: image-carousel-default-name**

Test seeds an image-carousel widget whose `accessible_name` setting equals `'Image Carousel'`. Impl `src/audits/image-carousel-default-name.ts`:

```ts
import { __ } from '@wordpress/i18n';
import { walkElements } from '../lib/walk';
import { type AuditDescriptor, type AuditEvaluator, type AuditViolation } from '../types';

const DEFAULT_NAME = 'Image Carousel';

export const descriptor: AuditDescriptor = {
    id: 'audits/image-carousel-default-name',
    title: __( 'Image carousel uses its default accessible name', 'elementor' ),
    description: __( 'A generic name like "Image Carousel" is not descriptive for screen readers.', 'elementor' ),
    fixHint: __( 'Set a meaningful accessible name based on the carousel content.', 'elementor' ),
    categories: [ 'accessibility', 'seo' ],
    severity: 'warning',
    weight: 5,
};

export const evaluator: AuditEvaluator = ( ctx ) => {
    const violations: AuditViolation[] = [];
    walkElements( ctx.elements.tree, ( node ) => {
        if ( node.elType !== 'widget' || node.widgetType !== 'image-carousel' ) {
            return;
        }
        const name = ( node.settings.accessible_name ?? node.settings._aria_label ?? '' ) as string;
        if ( ! name || name.trim().toLowerCase() === DEFAULT_NAME.toLowerCase() ) {
            violations.push( {
                auditId: descriptor.id,
                elementId: node.id,
                targetHint: 'element-settings',
                label: __( 'Image carousel uses the default name.', 'elementor' ),
            } );
        }
    } );
    return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
};
```

- [x] **Step 11: nested-boxed-containers**

Test seeds a boxed container inside a boxed container. Impl `src/audits/nested-boxed-containers.ts`:

```ts
import { __ } from '@wordpress/i18n';
import { walkElements } from '../lib/walk';
import { type AuditDescriptor, type AuditEvaluator, type AuditViolation } from '../types';

export const descriptor: AuditDescriptor = {
    id: 'audits/nested-boxed-containers',
    title: __( 'Boxed container nested inside a boxed parent', 'elementor' ),
    description: __( 'An inner container does not need to be boxed when its parent already is.', 'elementor' ),
    fixHint: __( 'Change the inner container\'s content width to Full Width.', 'elementor' ),
    categories: [ 'performance', 'health' ],
    severity: 'warning',
    weight: 5,
};

function isBoxed( settings: Record< string, unknown > ): boolean {
    return settings.content_width === 'boxed';
}

export const evaluator: AuditEvaluator = ( ctx ) => {
    const violations: AuditViolation[] = [];
    walkElements( ctx.elements.tree, ( node, parents ) => {
        if ( node.elType !== 'container' || ! isBoxed( node.settings ) ) {
            return;
        }
        const nearestContainerAncestor = [ ...parents ].reverse().find( ( p ) => p.elType === 'container' );
        if ( nearestContainerAncestor && isBoxed( nearestContainerAncestor.settings ) ) {
            violations.push( {
                auditId: descriptor.id,
                elementId: node.id,
                targetHint: 'element-settings',
                label: __( 'Nested boxed container.', 'elementor' ),
            } );
        }
    } );
    return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
};
```

- [x] **Step 12: icon-widget-link-missing-aria-label**

Test seeds an icon widget with `link.url` set and no `aria-label` custom attribute. Impl `src/audits/icon-widget-link-missing-aria-label.ts`:

```ts
import { __ } from '@wordpress/i18n';
import { walkElements } from '../lib/walk';
import { type AuditDescriptor, type AuditEvaluator, type AuditViolation } from '../types';

export const descriptor: AuditDescriptor = {
    id: 'audits/icon-widget-link-missing-aria-label',
    title: __( 'Icon link missing aria-label', 'elementor' ),
    description: __( 'Icon-only links need an aria-label so screen readers can announce the link target.', 'elementor' ),
    fixHint: __( 'Add an aria-label custom attribute to the icon widget describing the link\'s destination.', 'elementor' ),
    categories: [ 'accessibility' ],
    severity: 'warning',
    weight: 5,
};

function customAttributesHaveAria( attributes: unknown ): boolean {
    if ( typeof attributes !== 'string' || attributes.trim() === '' ) {
        return false;
    }
    // Custom attributes are stored as "key|value, key|value" pairs.
    return attributes
        .split( ',' )
        .map( ( pair ) => pair.split( '|' )[ 0 ]?.trim().toLowerCase() )
        .some( ( key ) => key === 'aria-label' || key === 'aria-labelledby' );
}

export const evaluator: AuditEvaluator = ( ctx ) => {
    const violations: AuditViolation[] = [];
    walkElements( ctx.elements.tree, ( node ) => {
        if ( node.elType !== 'widget' || node.widgetType !== 'icon' ) {
            return;
        }
        const link = node.settings.link as { url?: string } | undefined;
        if ( ! link?.url ) {
            return;
        }
        if ( ! customAttributesHaveAria( node.settings.custom_attributes ?? node.settings._attributes ) ) {
            violations.push( {
                auditId: descriptor.id,
                elementId: node.id,
                targetHint: 'element-settings',
                label: __( 'Icon link is missing aria-label.', 'elementor' ),
            } );
        }
    } );
    return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
};
```

- [x] **Step 13: Register all 12 in one place**

Create `src/audits/register-built-ins.ts`:

```ts
import { registerAudit } from '../registry';

import { descriptor as defaultDesignSystemDescriptor, evaluator as defaultDesignSystemEvaluator } from './default-design-system';
import { descriptor as headingStructureDescriptor, evaluator as headingStructureEvaluator } from './heading-structure';
import { descriptor as iconLinkDescriptor, evaluator as iconLinkEvaluator } from './icon-widget-link-missing-aria-label';
import { descriptor as carouselNameDescriptor, evaluator as carouselNameEvaluator } from './image-carousel-default-name';
import { descriptor as imagesMissingAltDescriptor, evaluator as imagesMissingAltEvaluator } from './images-missing-alt';
import { descriptor as imagesTooLargeDescriptor, evaluator as imagesTooLargeEvaluator } from './images-too-large';
import { descriptor as missingExcerptDescriptor, evaluator as missingExcerptEvaluator } from './missing-excerpt';
import { descriptor as missingFeaturedImageDescriptor, evaluator as missingFeaturedImageEvaluator } from './missing-featured-image';
import { descriptor as missingPageTitleDescriptor, evaluator as missingPageTitleEvaluator } from './missing-page-title';
import { descriptor as nestedBoxedDescriptor, evaluator as nestedBoxedEvaluator } from './nested-boxed-containers';
import { descriptor as preferGlobalColorsDescriptor, evaluator as preferGlobalColorsEvaluator } from './prefer-global-colors';
import { descriptor as usesSectionsDescriptor, evaluator as usesSectionsEvaluator } from './uses-sections-or-columns';

export function registerBuiltInAudits(): void {
    registerAudit( missingPageTitleDescriptor, missingPageTitleEvaluator );
    registerAudit( missingExcerptDescriptor, missingExcerptEvaluator );
    registerAudit( missingFeaturedImageDescriptor, missingFeaturedImageEvaluator );
    registerAudit( usesSectionsDescriptor, usesSectionsEvaluator );
    registerAudit( defaultDesignSystemDescriptor, defaultDesignSystemEvaluator );
    registerAudit( headingStructureDescriptor, headingStructureEvaluator );
    registerAudit( imagesMissingAltDescriptor, imagesMissingAltEvaluator );
    registerAudit( imagesTooLargeDescriptor, imagesTooLargeEvaluator );
    registerAudit( preferGlobalColorsDescriptor, preferGlobalColorsEvaluator );
    registerAudit( carouselNameDescriptor, carouselNameEvaluator );
    registerAudit( nestedBoxedDescriptor, nestedBoxedEvaluator );
    registerAudit( iconLinkDescriptor, iconLinkEvaluator );
}
```

- [x] **Step 14: Write the 11 remaining test files following the missing-page-title pattern in Step 1**

Each tests its evaluator with seeded `AuditContext` fixtures. Keep tests minimal: one passing case + one failing case + one edge case where it makes sense.

- [x] **Step 15: Run all audit tests**

```bash
cd packages && npx jest packages/core/editor-audits/src/audits
```

Expected: PASS — at least 24 tests (12 audits × ~2 per).

- [x] **Step 16: Commit**

```bash
git add packages/packages/core/editor-audits/src/audits
git commit -m "feat(editor-audits): 12 built-in audit evaluators"
```

---

## Task 9: Hooks — useAuditReport + useViolationFocus

**Files:**
- Create: `src/hooks/use-audit-report.ts`
- Create: `src/hooks/use-violation-focus.ts`

- [x] **Step 1: useAuditReport**

Create `src/hooks/use-audit-report.ts`:

```ts
import { __useDispatch as useDispatch, __useSelector as useSelector } from '@elementor/store';

import { runPageAudit } from '../runner';
import { selectError, selectReport, selectStatus, slice } from '../store';

export function useAuditReport() {
    const status = useSelector( selectStatus );
    const report = useSelector( selectReport );
    const error = useSelector( selectError );
    const dispatch = useDispatch();

    const run = async ( documentId: number ) => {
        dispatch( slice.actions.runStarted() );
        try {
            const report = await runPageAudit( documentId );
            dispatch( slice.actions.runSucceeded( report ) );
        } catch ( e ) {
            dispatch( slice.actions.runFailed( e instanceof Error ? e.message : 'Unknown error' ) );
        }
    };

    return { status, report, error, run };
}
```

- [x] **Step 2: useViolationFocus**

Create `src/hooks/use-violation-focus.ts`:

```ts
import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

import { type AuditViolation } from '../types';

declare global {
    interface Window {
        elementor?: {
            getContainer?: ( id: string ) => unknown;
        };
        $e?: { run?: ( command: string, args?: unknown ) => unknown };
    }
}

export function useViolationFocus() {
    return {
        focus( violation: AuditViolation ): void {
            if ( violation.elementId ) {
                const container = window.elementor?.getContainer?.( violation.elementId );
                if ( container ) {
                    runCommand( 'document/elements/select', { container } );
                }
                if ( violation.targetHint === 'element-settings' ) {
                    runCommand( 'panel/editor/open' );
                }
                return;
            }
            if ( violation.targetHint === 'page-settings' ) {
                runCommand( 'panel/page-settings/settings' );
                return;
            }
            if ( violation.targetHint === 'site-settings' ) {
                runCommand( 'panel/global/open' );
            }
        },
    };
}
```

The exact V1 commands above (`panel/editor/open`, `panel/page-settings/settings`, `panel/global/open`) are confirmed-existing in Elementor V1. If any have changed, the engineer adjusts at implementation time.

- [x] **Step 3: Commit**

```bash
git add packages/packages/core/editor-audits/src/hooks
git commit -m "feat(editor-audits): useAuditReport + useViolationFocus hooks"
```

---

## Task 10: UI states (empty / loading / error)

**Files:**
- Create: `src/components/states/empty-state.tsx`
- Create: `src/components/states/loading-state.tsx`
- Create: `src/components/states/error-state.tsx`

- [x] **Step 1: Empty state**

Create `src/components/states/empty-state.tsx`:

```tsx
import * as React from 'react';
import { Box, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export default function EmptyState() {
    return (
        <Box
            sx={ { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, p: 4 } }
        >
            <Typography variant="subtitle1">{ __( 'Audit your page', 'elementor' ) }</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
                { __( 'Check SEO, accessibility, performance, and health issues. Click "Run page audit" to begin.', 'elementor' ) }
            </Typography>
        </Box>
    );
}
```

- [x] **Step 2: Loading state**

Create `src/components/states/loading-state.tsx`:

```tsx
import * as React from 'react';
import { Box, CircularProgress, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export default function LoadingState() {
    return (
        <Box sx={ { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, p: 4 } }>
            <CircularProgress size={ 32 } />
            <Typography variant="body2">{ __( 'Auditing page…', 'elementor' ) }</Typography>
        </Box>
    );
}
```

- [x] **Step 3: Error state**

Create `src/components/states/error-state.tsx`:

```tsx
import * as React from 'react';
import { Box, Button, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type Props = {
    message: string;
    onRetry: () => void;
};

export default function ErrorState( { message, onRetry }: Props ) {
    return (
        <Box sx={ { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, p: 4 } }>
            <Typography variant="body2" color="error" textAlign="center">{ message }</Typography>
            <Button variant="contained" size="small" onClick={ onRetry }>
                { __( 'Try again', 'elementor' ) }
            </Button>
        </Box>
    );
}
```

- [x] **Step 4: Commit**

```bash
git add packages/packages/core/editor-audits/src/components/states
git commit -m "feat(editor-audits): empty / loading / error states"
```

---

## Task 11: ScoreGauge + Score tab

**Files:**
- Create: `src/components/tabs/score-gauge.tsx`
- Create: `src/components/tabs/score-tab.tsx`

- [x] **Step 1: ScoreGauge**

Create `src/components/tabs/score-gauge.tsx`:

```tsx
import * as React from 'react';
import { Box, CircularProgress, Typography } from '@elementor/ui';

type Props = {
    score: number;
    label: string;
    size?: number;
    onClick?: () => void;
};

function colorFor( score: number ): 'success' | 'warning' | 'error' {
    if ( score >= 90 ) {
        return 'success';
    }
    if ( score >= 50 ) {
        return 'warning';
    }
    return 'error';
}

export default function ScoreGauge( { score, label, size = 96, onClick }: Props ) {
    return (
        <Box
            role={ onClick ? 'button' : undefined }
            tabIndex={ onClick ? 0 : -1 }
            onClick={ onClick }
            onKeyDown={ ( event ) => {
                if ( onClick && ( event.key === 'Enter' || event.key === ' ' ) ) {
                    onClick();
                }
            } }
            aria-label={ `${ label } ${ score } of 100` }
            sx={ {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                cursor: onClick ? 'pointer' : 'default',
                outline: 'none',
                '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', borderRadius: 1 },
            } }
        >
            <Box sx={ { position: 'relative', display: 'inline-flex' } }>
                <CircularProgress
                    variant="determinate"
                    value={ 100 }
                    size={ size }
                    thickness={ 4 }
                    sx={ { color: 'action.disabledBackground' } }
                />
                <CircularProgress
                    variant="determinate"
                    value={ score }
                    size={ size }
                    thickness={ 4 }
                    color={ colorFor( score ) }
                    sx={ { position: 'absolute', left: 0 } }
                />
                <Box sx={ { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' } }>
                    <Typography variant="subtitle1" component="span">{ score }</Typography>
                </Box>
            </Box>
            <Typography variant="caption">{ label }</Typography>
        </Box>
    );
}
```

- [x] **Step 2: ScoreTab**

Create `src/components/tabs/score-tab.tsx`:

```tsx
import * as React from 'react';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type AuditCategory, type PageAuditReport } from '../../types';
import ScoreGauge from './score-gauge';

type Props = {
    report: PageAuditReport;
    onCategoryClick: ( category: AuditCategory ) => void;
};

const CATEGORY_LABELS: Record< AuditCategory, string > = {
    health: __( 'Health', 'elementor' ),
    seo: __( 'SEO', 'elementor' ),
    accessibility: __( 'Accessibility', 'elementor' ),
    performance: __( 'Performance', 'elementor' ),
    'best-practices': __( 'Best Practices', 'elementor' ),
};

const TAB_CATEGORIES: AuditCategory[] = [ 'health', 'seo', 'accessibility', 'performance' ];

export default function ScoreTab( { report, onCategoryClick }: Props ) {
    return (
        <Box sx={ { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 } }>
            <ScoreGauge score={ report.overall } label={ __( 'Overall', 'elementor' ) } size={ 128 } />
            <Box sx={ { display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' } }>
                { TAB_CATEGORIES.filter( ( category ) => report.categories[ category ].total > 0 ).map( ( category ) => (
                    <ScoreGauge
                        key={ category }
                        score={ report.categories[ category ].score }
                        label={ CATEGORY_LABELS[ category ] }
                        onClick={ () => onCategoryClick( category ) }
                    />
                ) ) }
            </Box>
        </Box>
    );
}
```

- [x] **Step 3: Commit**

```bash
git add packages/packages/core/editor-audits/src/components/tabs
git commit -m "feat(editor-audits): ScoreGauge + Score tab"
```

---

## Task 12: ViolationRow + Category tab

**Files:**
- Create: `src/components/tabs/violation-row.tsx`
- Create: `src/components/tabs/category-tab.tsx`

- [x] **Step 1: ViolationRow**

Create `src/components/tabs/violation-row.tsx`:

```tsx
import * as React from 'react';
import { Box, Collapse, IconButton, Typography } from '@elementor/ui';
import { ChevronDownIcon } from '@elementor/icons';

import { useViolationFocus } from '../../hooks/use-violation-focus';
import { type AuditDescriptor, type AuditViolation } from '../../types';

type Props = {
    descriptor: AuditDescriptor;
    violations: AuditViolation[];
};

export default function ViolationRow( { descriptor, violations }: Props ) {
    const [ expanded, setExpanded ] = React.useState( false );
    const { focus } = useViolationFocus();

    return (
        <Box sx={ { borderBottom: 1, borderColor: 'divider' } }>
            <Box
                sx={ { display: 'flex', alignItems: 'center', gap: 1, py: 1, px: 1.5, cursor: 'pointer' } }
                onClick={ () => setExpanded( ( v ) => ! v ) }
            >
                <Typography variant="body2" sx={ { flex: 1 } }>{ descriptor.title }</Typography>
                <Typography variant="caption" color="text.secondary">{ violations.length }</Typography>
                <IconButton size="small" aria-label={ expanded ? 'Collapse' : 'Expand' }>
                    <ChevronDownIcon sx={ { transform: expanded ? 'rotate(180deg)' : undefined, transition: 'transform .2s' } } />
                </IconButton>
            </Box>
            <Collapse in={ expanded }>
                <Box sx={ { px: 2, py: 1, color: 'text.secondary' } }>
                    <Typography variant="caption" component="p">{ descriptor.description }</Typography>
                    <Typography variant="caption" component="p" sx={ { mt: 0.5 } }>{ descriptor.fixHint }</Typography>
                </Box>
                <Box role="list" sx={ { pb: 1 } }>
                    { violations.map( ( violation, idx ) => (
                        <Box
                            key={ idx }
                            role="button"
                            tabIndex={ 0 }
                            onClick={ () => focus( violation ) }
                            onKeyDown={ ( event ) => {
                                if ( event.key === 'Enter' || event.key === ' ' ) {
                                    focus( violation );
                                }
                            } }
                            sx={ { px: 2, py: 0.5, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } } }
                        >
                            <Typography variant="caption">{ violation.label }</Typography>
                        </Box>
                    ) ) }
                </Box>
            </Collapse>
        </Box>
    );
}
```

- [x] **Step 2: CategoryTab**

Create `src/components/tabs/category-tab.tsx`:

```tsx
import * as React from 'react';
import { Box, Collapse, Typography } from '@elementor/ui';
import { __, sprintf } from '@wordpress/i18n';

import { type AuditCategory, type PageAuditReport } from '../../types';
import ViolationRow from './violation-row';

type Props = {
    category: AuditCategory;
    report: PageAuditReport;
};

export default function CategoryTab( { category, report }: Props ) {
    const inCategory = report.auditResults.filter( ( r ) => r.descriptor.categories.includes( category ) );
    const failed = inCategory.filter( ( r ) => r.result.status === 'fail' );
    const passed = inCategory.filter( ( r ) => r.result.status === 'pass' );
    const skipped = inCategory.filter( ( r ) => r.result.status === 'skipped' );
    const [ showPassed, setShowPassed ] = React.useState( false );

    return (
        <Box>
            <Typography variant="body2" sx={ { px: 2, py: 1 } }>
                { sprintf( __( '%d issues found', 'elementor' ), failed.reduce( ( n, r ) => n + ( r.result.status === 'fail' ? r.result.violations.length : 0 ), 0 ) ) }
            </Typography>
            { failed.map( ( r ) => (
                <ViolationRow
                    key={ r.descriptor.id }
                    descriptor={ r.descriptor }
                    violations={ r.result.status === 'fail' ? r.result.violations : [] }
                />
            ) ) }
            { skipped.map( ( r ) => (
                <Box key={ r.descriptor.id } sx={ { py: 1, px: 2, opacity: 0.5 } } title={ r.result.status === 'skipped' ? r.result.reason : '' }>
                    <Typography variant="caption">{ r.descriptor.title } — { __( 'skipped', 'elementor' ) }</Typography>
                </Box>
            ) ) }
            { passed.length > 0 && (
                <Box sx={ { p: 1, cursor: 'pointer' } } onClick={ () => setShowPassed( ( v ) => ! v ) }>
                    <Typography variant="caption" color="text.secondary">
                        { sprintf( __( '%d audits passed', 'elementor' ), passed.length ) }
                    </Typography>
                </Box>
            ) }
            <Collapse in={ showPassed }>
                { passed.map( ( r ) => (
                    <Box key={ r.descriptor.id } sx={ { py: 0.5, px: 2, opacity: 0.6 } }>
                        <Typography variant="caption">{ r.descriptor.title }</Typography>
                    </Box>
                ) ) }
            </Collapse>
        </Box>
    );
}
```

- [x] **Step 3: Commit**

```bash
git add packages/packages/core/editor-audits/src/components/tabs
git commit -m "feat(editor-audits): ViolationRow + Category tab"
```

---

## Task 13: Audit panel composition

**Files:**
- Create: `src/components/audit-panel.tsx`

- [x] **Step 1: Compose the panel**

Create `src/components/audit-panel.tsx`:

```tsx
import * as React from 'react';
import { Box, Button, Tab, Tabs, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { FloatingPanelBody, FloatingPanelFooter, FloatingPanelHeader } from '@elementor/editor-floating-panels';

import { useAuditReport } from '../hooks/use-audit-report';
import { type AuditCategory } from '../types';

import EmptyState from './states/empty-state';
import ErrorState from './states/error-state';
import LoadingState from './states/loading-state';
import CategoryTab from './tabs/category-tab';
import ScoreTab from './tabs/score-tab';

const TAB_CATEGORIES: AuditCategory[] = [ 'health', 'seo', 'accessibility', 'performance' ];
const TAB_LABELS: Record< AuditCategory, string > = {
    health: __( 'Health', 'elementor' ),
    seo: __( 'SEO', 'elementor' ),
    accessibility: __( 'Accessibility', 'elementor' ),
    performance: __( 'Performance', 'elementor' ),
    'best-practices': __( 'Best Practices', 'elementor' ),
};

declare global {
    interface Window {
        elementor?: { documents?: { getCurrent?: () => { id: number } | undefined } };
    }
}

export default function AuditPanel() {
    const { status, report, error, run } = useAuditReport();
    const [ activeTab, setActiveTab ] = React.useState< 'score' | AuditCategory >( 'score' );

    const currentDocumentId = window.elementor?.documents?.getCurrent?.()?.id ?? 0;
    const onRun = () => run( currentDocumentId );
    const lastScanLabel = report ? new Date( report.runAt ).toLocaleTimeString() : null;

    return (
        <>
            <FloatingPanelHeader panelId="audit-panel" title={ __( 'Audit', 'elementor' ) } />
            <FloatingPanelBody>
                { status === 'idle' && <EmptyState /> }
                { status === 'loading' && <LoadingState /> }
                { status === 'error' && <ErrorState message={ error ?? '' } onRetry={ onRun } /> }
                { status === 'ready' && report && (
                    <Box>
                        <Tabs
                            value={ activeTab }
                            onChange={ ( _, value ) => setActiveTab( value as 'score' | AuditCategory ) }
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            <Tab value="score" label={ __( 'Score', 'elementor' ) } />
                            { TAB_CATEGORIES.filter( ( c ) => report.categories[ c ].total > 0 ).map( ( c ) => (
                                <Tab key={ c } value={ c } label={ TAB_LABELS[ c ] } />
                            ) ) }
                        </Tabs>
                        { activeTab === 'score' ? (
                            <ScoreTab report={ report } onCategoryClick={ ( c ) => setActiveTab( c ) } />
                        ) : (
                            <CategoryTab category={ activeTab } report={ report } />
                        ) }
                    </Box>
                ) }
            </FloatingPanelBody>
            <FloatingPanelFooter>
                { lastScanLabel ? (
                    <Typography variant="caption" sx={ { flex: 1 } }>
                        { __( 'Last scan:', 'elementor' ) } { lastScanLabel }
                    </Typography>
                ) : (
                    <Box sx={ { flex: 1 } } />
                ) }
                <Button
                    variant="contained"
                    size="small"
                    onClick={ onRun }
                    disabled={ status === 'loading' || currentDocumentId === 0 }
                >
                    { lastScanLabel ? __( 'Re-scan', 'elementor' ) : __( 'Run page audit', 'elementor' ) }
                </Button>
            </FloatingPanelFooter>
        </>
    );
}
```

- [x] **Step 2: Lint and commit**

```bash
cd packages && npm run lint
```

```bash
git add packages/packages/core/editor-audits/src/components/audit-panel.tsx
git commit -m "feat(editor-audits): compose Audit panel UI"
```

---

## Task 14: Top-bar toggle

**Files:**
- Create: `src/panel-instance.ts`
- Create: `src/components/audit-toolbar-toggle.tsx`
- Create: `src/hooks/use-audit-toggle-props.ts`

- [x] **Step 1: Extract the floating-panel instance**

Create `src/panel-instance.ts`. Isolated from `init.ts` to avoid a circular import (the toggle hook needs the panel; the panel composition is loaded by `init.ts` which also wires the toggle):

```ts
import { createFloatingPanel } from '@elementor/editor-floating-panels';

import AuditPanel from './components/audit-panel';

export const AUDIT_PANEL_ID = 'audit-panel';

export const auditPanel = createFloatingPanel( {
    id: AUDIT_PANEL_ID,
    title: 'Audit',
    icon: () => null,
    component: AuditPanel,
    defaults: {
        width: 360,
        height: 600,
        minWidth: 280,
        minHeight: 400,
        initialMode: 'docked',
    },
} );
```

- [x] **Step 2: useAuditToggleProps**

Create `src/hooks/use-audit-toggle-props.ts`:

```ts
import { __ } from '@wordpress/i18n';

import { auditPanel } from '../panel-instance';

export function useAuditToggleProps() {
    const { isOpen } = auditPanel.useFloatingPanelStatus();
    const { toggle } = auditPanel.useFloatingPanelActions();

    return {
        title: __( 'Audit Page', 'elementor' ),
        selected: isOpen,
        onClick: () => toggle(),
    };
}
```

- [x] **Step 3: Toolbar toggle registration**

Create `src/components/audit-toolbar-toggle.tsx`:

```ts
import { utilitiesMenu } from '@elementor/editor-app-bar';

import { useAuditToggleProps } from '../hooks/use-audit-toggle-props';

export function registerAuditToolbarToggle(): void {
    utilitiesMenu.registerToggleAction( {
        id: 'toggle-audit-panel',
        priority: 30,
        useProps: useAuditToggleProps,
    } );
}
```

- [x] **Step 4: Commit**

```bash
git add packages/packages/core/editor-audits/src
git commit -m "feat(editor-audits): top-bar toggle action"
```

---

## Task 15: init()

**Files:**
- Modify: `src/init.ts`
- Modify: `src/index.ts`

- [x] **Step 1: Implement init**

Create `src/init.ts`:

```ts
import { registerFloatingPanel } from '@elementor/editor-floating-panels';
import { __registerSlice } from '@elementor/store';

import { registerAuditToolbarToggle } from './components/audit-toolbar-toggle';
import { registerBuiltInAudits } from './audits/register-built-ins';
import { auditPanel } from './panel-instance';
import { slice } from './store/slice';

export function init(): void {
    __registerSlice( slice );
    registerBuiltInAudits();
    registerFloatingPanel( auditPanel.panel );
    registerAuditToolbarToggle();
}
```

- [x] **Step 2: Public exports**

Replace `src/index.ts`:

```ts
export { init } from './init';
export { registerAudit } from './registry';
export { Audit } from './audit';
export { runPageAudit } from './runner';
export type {
    AuditCategory,
    AuditContext,
    AuditDescriptor,
    AuditEvaluator,
    AuditResult,
    AuditSeverity,
    AuditViolation,
    PageAuditReport,
} from './types';
```

- [x] **Step 3: Lint + build**

```bash
cd packages && npm run lint && npm run build:packages
```

Expected: PASS.

- [x] **Step 4: Commit**

```bash
git add packages/packages/core/editor-audits/src
git commit -m "feat(editor-audits): init() ties registry + floating panel + toggle"
```

---

## Task 16: Wire the package into the editor bootstrap

The modern editor packages get their `init()` called from `assets/dev/js/editor/elementor.js` or a similar bootstrap. Verify by reading how `editor-app-bar` or `site-navigation` get initialized, then add the audits init call alongside them.

**Files:**
- Modify: editor bootstrap (path discovered during implementation)

- [x] **Step 1: Locate the bootstrap**

```bash
rg "from '@elementor/editor-app-bar'" assets
```

Expected: a single hit in the editor bootstrap that imports `init` from `@elementor/editor-app-bar`. Use the same file to add the audits init.

- [x] **Step 2: Add the import + init call**

In the bootstrap file, alongside other modern-package inits:

```ts
import { init as initAudits } from '@elementor/editor-audits';
// ... existing inits ...
initAudits();
```

- [x] **Step 3: Build the editor assets**

```bash
npx grunt scripts
```

Expected: PASS.

- [x] **Step 4: Commit**

```bash
git add assets
git commit -m "feat(editor-audits): wire init into editor bootstrap"
```

---

## Task 17: Playwright happy-path E2E

**Files:**
- Create: `tests/playwright/sanity/modules/audits/audit-panel.test.ts`

- [x] **Step 1: Write the E2E**

Create `tests/playwright/sanity/modules/audits/audit-panel.test.ts`:

```ts
import { expect, test } from '@playwright/test';
import { WpAdminPage } from '../../../pages/wp-admin-page';

test( 'audit panel opens, runs, lists a violation, and deep-links to the offending element', async ( { page, apiRequests }, testInfo ) => {
    const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
    const editor = await wpAdmin.openNewPage();

    // Arrange: seed an image widget without alt text.
    await editor.addWidget( 'image' );

    // Act: open the audit panel toggle.
    await page.getByRole( 'button', { name: /audit page/i } ).click();

    // Assert: panel renders the empty state with Run page audit button.
    await expect( page.getByRole( 'button', { name: /run page audit/i } ) ).toBeVisible();

    // Act: run the audit.
    await page.getByRole( 'button', { name: /run page audit/i } ).click();

    // Assert: results render and re-scan is offered.
    await expect( page.getByRole( 'button', { name: /re-scan/i } ) ).toBeVisible();

    // Switch to Accessibility tab.
    await page.getByRole( 'tab', { name: /accessibility/i } ).click();

    // Assert: 'Images missing alt text' violation is listed.
    await expect( page.getByText( /images missing alt text/i ) ).toBeVisible();

    // Expand it and click the first violation row.
    await page.getByText( /images missing alt text/i ).click();
    await page.getByRole( 'button' ).filter( { hasText: /image is missing alt text/i } ).first().click();

    // Assert: the image element became the selected element on the canvas.
    await expect( editor.getPreviewFrame().locator( '.elementor-element.elementor-element-edit-mode' ) ).toBeVisible();
} );
```

The exact `page.getByRole` selectors may need tuning to match the actual DOM produced by `@elementor/ui` MUI components. Run once, adjust if needed, then commit.

- [x] **Step 2: Run the E2E**

Per the repo's testing docs (`tests/test-environment-setup.md`):

```bash
SKIP_CONFIRMATION=true npm run env:setup
npx playwright test tests/playwright/sanity/modules/audits
```

Expected: PASS.

- [x] **Step 3: Commit**

```bash
git add tests/playwright/sanity/modules/audits
git commit -m "test(editor-audits): happy-path Playwright E2E"
```

---

## Task 18: Final checks

- [x] **Step 1: Full test runs**

```bash
cd packages && npm run lint && npx jest packages/core/editor-audits
```

Expected: PASS for both.

```bash
vendor/bin/phpunit tests/phpunit/elementor/modules/audits
```

Expected: PASS.

- [x] **Step 2: Build**

```bash
npm run build:packages && npx grunt scripts && npx grunt styles
```

Expected: PASS.

- [x] **Step 3: Manual smoke**

Open the editor, click the audit toggle, run a page audit, click violations, verify deep-links work.

- [x] **Step 4: Commit final tweaks**

```bash
git status
# Commit any incidental drift.
```

---

## Acceptance criteria

- The audit toggle appears in the editor's utilities menu and toggles the floating panel.
- Clicking "Run page audit" produces a `PageAuditReport` with 12 audit results (or `skipped` for any whose evaluator threw).
- The Score tab shows an overall gauge and category gauges sized to the failure count.
- Each category tab lists violations grouped by audit; passing audits are collapsed under a footer.
- Clicking a violation with an `elementId` selects the corresponding element on the canvas; with `targetHint: 'element-settings'` it also opens the element editor; with `'page-settings'` or `'site-settings'` it opens that panel.
- All Jest tests, PHPUnit tests, and the new Playwright E2E pass.

## Out of scope (deferred)

- A separate "Best Practices" tab (best-practices audits live in Health per design).
- Per-audit configuration UI (image-size threshold etc.).
- Per-control focus inside the element settings panel (`element-settings` opens the editor panel; specific control focus is a follow-up).
- Re-running on document change. v1 is on-demand; live audits are deferred.
- Pro audits and the registry's locked/upgrade UI for them — Pro registers its own audits in the Pro repo using the same `registerAudit` API.
