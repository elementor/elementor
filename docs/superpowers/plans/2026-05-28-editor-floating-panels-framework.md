# Editor Floating Panels Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the `@elementor/editor-floating-panels` package — a generic floating + dockable React panel framework that any editor feature can consume, with the audit panel (plan 3) as the first consumer.

**Architecture:** A new workspace package under `packages/packages/core/editor-floating-panels/`. Modeled after `@elementor/editor-panels` but built around three orthogonal axes: open/closed state, dock mode (docked vs floating), and logical position. Multiple panels can be open simultaneously. Direction-sensitive layout uses CSS logical properties (`inset-inline-end`, etc.), and the single physical→logical conversion (`isRtl ? -dx : dx`) lives in one pure function tested in isolation.

**Tech Stack:** TypeScript, React 18, `@elementor/store` (redux toolkit slice), `@elementor/ui` (MUI-based), `@elementor/locations`, `@elementor/editor-v1-adapters`, `@elementor/editor`, tsup, Jest + React Testing Library.

**Spec reference:** `docs/superpowers/specs/2026-05-28-editor-audit-panel-design.md` §6 (Floating panel framework).

---

## Prerequisites

- Working on a branch off `master`. Suggested name: `ED-XXXXX-editor-floating-panels`.
- Node version from `.nvmrc` is active.
- `npm ci --ignore-scripts` and `npm run build:packages` succeed on the current branch.

## File structure

```
packages/packages/core/editor-floating-panels/
├── package.json
├── CHANGELOG.md
├── README.md
└── src/
    ├── index.ts                                  # public exports
    ├── init.ts                                   # called by the editor bootstrap
    ├── api.ts                                    # createFloatingPanel + registerFloatingPanel
    ├── location.ts                               # createLocation for injection
    ├── sync.ts                                   # listens to v1 editor events, manages host mount
    ├── persistence.ts                            # read/write per-user state via window.elementor.settings
    ├── types.ts                                  # public types: DockMode, FloatingPanelDeclaration, etc.
    ├── store/
    │   ├── index.ts                              # re-exports slice + selectors
    │   ├── slice.ts                              # createSlice with reducers
    │   └── selectors.ts                          # selectPanelState, selectIsOpen, selectDockMode, etc.
    ├── lib/
    │   ├── drag-math.ts                          # pure: physicalToLogicalDelta, applyDragDelta
    │   ├── snap-to-dock.ts                       # pure: shouldSnapToDock
    │   ├── direction.ts                          # pure: isRtl() reading <html dir>
    │   └── __tests__/
    │       ├── drag-math.test.ts
    │       └── snap-to-dock.test.ts
    ├── hooks/
    │   ├── use-floating-panel-status.ts
    │   ├── use-floating-panel-actions.ts
    │   └── use-floating-panel-drag.ts            # binds pointer events; calls drag-math
    ├── components/
    │   ├── external/
    │   │   ├── index.ts
    │   │   ├── floating-panel.tsx                # full panel wrapper, calls into internal
    │   │   ├── floating-panel-header.tsx        # title + drag handle + dock toggle + close
    │   │   ├── floating-panel-body.tsx
    │   │   └── floating-panel-footer.tsx
    │   └── internal/
    │       ├── host.tsx                          # injected once at editor top; renders all open panels
    │       ├── panel-window.tsx                  # wraps a panel in docked OR floating positioning
    │       └── drag-handle.tsx                   # interactive drag surface
    └── __tests__/
        ├── api.test.tsx
        ├── persistence.test.ts
        ├── sync.test.tsx
        └── host.test.tsx
```

No file should exceed ~300 lines.

---

## Task 1: Scaffold the package

**Files:**
- Create: `packages/packages/core/editor-floating-panels/package.json`
- Create: `packages/packages/core/editor-floating-panels/CHANGELOG.md`
- Create: `packages/packages/core/editor-floating-panels/README.md`
- Create: `packages/packages/core/editor-floating-panels/src/index.ts`

- [ ] **Step 1: Create the package.json**

Mirror `@elementor/editor-panels` versions and toolchain exactly (run `cat packages/packages/core/editor-panels/package.json` first to confirm current versions; below uses the values present at time of writing).

```json
{
  "name": "@elementor/editor-floating-panels",
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
    "directory": "packages/core/editor-floating-panels"
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
    "@elementor/editor-v1-adapters": "4.2.0",
    "@elementor/locations": "4.2.0",
    "@elementor/store": "4.2.0",
    "@elementor/ui": "1.37.5"
  },
  "peerDependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "tsup": "^8.3.5"
  }
}
```

- [ ] **Step 2: Create the placeholder index and changelog/readme**

Create `src/index.ts` with a single export line so the build succeeds:

```ts
export {};
```

Create `CHANGELOG.md`:

```md
# @elementor/editor-floating-panels

## 4.2.0

- Initial release. Generic floating + dockable React panel framework.
```

Create a brief `README.md` explaining the package's purpose and pointing at the design spec.

- [ ] **Step 3: Verify the workspace picks up the new package**

Run from the repo root:

```bash
npm install
```

Expected: `node_modules/@elementor/editor-floating-panels` symlink is created (workspaces auto-detect by glob; if not, check `packages/package.json` workspaces glob).

Run:

```bash
npm run build:packages
```

Expected: PASS, with `editor-floating-panels` in the build output and `dist/` populated with the empty exports.

- [ ] **Step 4: Lint passes**

Run:

```bash
cd packages && npx eslint packages/core/editor-floating-panels --report-unused-disable-directives-severity error
```

Expected: PASS with no errors.

- [ ] **Step 5: Commit**

```bash
git add packages/packages/core/editor-floating-panels
git commit -m "feat(editor-floating-panels): scaffold package"
```

---

## Task 2: Types + drag-math pure functions

Pure-function TDD first because they're the heart of the direction-sensitive logic and the easiest place to lock down the behavior.

**Files:**
- Create: `packages/packages/core/editor-floating-panels/src/types.ts`
- Create: `packages/packages/core/editor-floating-panels/src/lib/direction.ts`
- Create: `packages/packages/core/editor-floating-panels/src/lib/drag-math.ts`
- Create: `packages/packages/core/editor-floating-panels/src/lib/__tests__/drag-math.test.ts`

- [ ] **Step 1: Write the failing tests for drag-math**

Create `src/lib/__tests__/drag-math.test.ts`:

```ts
import { applyDragDelta, physicalToLogicalDelta } from '../drag-math';

describe( 'physicalToLogicalDelta', () => {
    it( 'returns delta unchanged in LTR', () => {
        // Arrange / Act.
        const result = physicalToLogicalDelta( { dx: 30, dy: 10 }, false );

        // Assert.
        expect( result ).toEqual( { inlineDelta: 30, blockDelta: 10 } );
    } );

    it( 'negates the inline delta in RTL', () => {
        // Arrange / Act.
        const result = physicalToLogicalDelta( { dx: 30, dy: 10 }, true );

        // Assert.
        expect( result ).toEqual( { inlineDelta: -30, blockDelta: 10 } );
    } );

    it( 'does not touch the block delta in RTL', () => {
        // Arrange / Act.
        const result = physicalToLogicalDelta( { dx: 0, dy: -45 }, true );

        // Assert.
        expect( result.blockDelta ).toBe( -45 );
    } );
} );

describe( 'applyDragDelta', () => {
    it( 'adds logical deltas to the start position', () => {
        // Arrange.
        const start = { insetInlineStart: 100, insetBlockStart: 50 };

        // Act.
        const next = applyDragDelta( start, { inlineDelta: 25, blockDelta: -10 } );

        // Assert.
        expect( next ).toEqual( { insetInlineStart: 125, insetBlockStart: 40 } );
    } );

    it( 'never returns negative inline-start', () => {
        // Arrange.
        const start = { insetInlineStart: 5, insetBlockStart: 5 };

        // Act.
        const next = applyDragDelta( start, { inlineDelta: -100, blockDelta: -100 } );

        // Assert.
        expect( next.insetInlineStart ).toBe( 0 );
        expect( next.insetBlockStart ).toBe( 0 );
    } );
} );
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd packages && npx jest packages/core/editor-floating-panels/src/lib/__tests__/drag-math.test.ts
```

Expected: FAIL — "Cannot find module '../drag-math'".

- [ ] **Step 3: Add the types module**

Create `src/types.ts`:

```ts
import { type ComponentType } from 'react';

export type DockMode = 'docked' | 'floating';

export type LogicalPosition = {
    insetInlineStart: number;
    insetBlockStart: number;
};

export type LogicalSize = {
    inlineSize: number;
    blockSize: number;
};

export type FloatingPanelDefaults = {
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
    initialMode: DockMode;
    initialPosition?: LogicalPosition;
};

export type FloatingPanelDeclaration = {
    id: string;
    title: string;
    icon: ComponentType;
    component: ComponentType;
    defaults: FloatingPanelDefaults;
};

export type FloatingPanelState = {
    isOpen: boolean;
    mode: DockMode;
    position: LogicalPosition;
    size: LogicalSize;
    zIndex: number;
};
```

- [ ] **Step 4: Implement drag-math**

Create `src/lib/drag-math.ts`:

```ts
import { type LogicalPosition } from '../types';

export type PhysicalDelta = { dx: number; dy: number };
export type LogicalDelta = { inlineDelta: number; blockDelta: number };

export function physicalToLogicalDelta( delta: PhysicalDelta, isRtl: boolean ): LogicalDelta {
    return {
        inlineDelta: isRtl ? -delta.dx : delta.dx,
        blockDelta: delta.dy,
    };
}

export function applyDragDelta( position: LogicalPosition, delta: LogicalDelta ): LogicalPosition {
    return {
        insetInlineStart: Math.max( 0, position.insetInlineStart + delta.inlineDelta ),
        insetBlockStart: Math.max( 0, position.insetBlockStart + delta.blockDelta ),
    };
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd packages && npx jest packages/core/editor-floating-panels/src/lib/__tests__/drag-math.test.ts
```

Expected: PASS — 5 tests pass.

- [ ] **Step 6: Add the direction helper (no test, trivial DOM read)**

Create `src/lib/direction.ts`:

```ts
export function isRtl(): boolean {
    return ( document?.documentElement?.dir ?? '' ).toLowerCase() === 'rtl';
}
```

- [ ] **Step 7: Commit**

```bash
git add packages/packages/core/editor-floating-panels/src
git commit -m "feat(editor-floating-panels): drag math + types"
```

---

## Task 3: Snap-to-dock pure function

**Files:**
- Create: `packages/packages/core/editor-floating-panels/src/lib/snap-to-dock.ts`
- Create: `packages/packages/core/editor-floating-panels/src/lib/__tests__/snap-to-dock.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/__tests__/snap-to-dock.test.ts`:

```ts
import { shouldSnapToDock, SNAP_THRESHOLD_PX } from '../snap-to-dock';

describe( 'shouldSnapToDock', () => {
    const viewport = { left: 0, right: 1200, top: 0, bottom: 800 };

    it( 'snaps when the panel right edge is within the threshold of viewport right (LTR)', () => {
        // Arrange.
        const panel = { left: 900, right: 1200 - 4, top: 100, bottom: 600 };

        // Act / Assert.
        expect( shouldSnapToDock( { panel, viewport, isRtl: false } ) ).toBe( true );
    } );

    it( 'does not snap when the panel is far from the inline-end edge (LTR)', () => {
        // Arrange.
        const panel = { left: 100, right: 500, top: 100, bottom: 600 };

        // Act / Assert.
        expect( shouldSnapToDock( { panel, viewport, isRtl: false } ) ).toBe( false );
    } );

    it( 'snaps when the panel left edge is within the threshold of viewport left (RTL)', () => {
        // Arrange.
        const panel = { left: 3, right: 300, top: 100, bottom: 600 };

        // Act / Assert.
        expect( shouldSnapToDock( { panel, viewport, isRtl: true } ) ).toBe( true );
    } );

    it( 'does not snap when the panel is far from the inline-end edge (RTL)', () => {
        // Arrange.
        const panel = { left: 700, right: 1100, top: 100, bottom: 600 };

        // Act / Assert.
        expect( shouldSnapToDock( { panel, viewport, isRtl: true } ) ).toBe( false );
    } );

    it( 'exposes the threshold as a named constant', () => {
        expect( typeof SNAP_THRESHOLD_PX ).toBe( 'number' );
        expect( SNAP_THRESHOLD_PX ).toBeGreaterThan( 0 );
    } );
} );
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd packages && npx jest packages/core/editor-floating-panels/src/lib/__tests__/snap-to-dock.test.ts
```

Expected: FAIL — "Cannot find module '../snap-to-dock'".

- [ ] **Step 3: Implement**

Create `src/lib/snap-to-dock.ts`:

```ts
export const SNAP_THRESHOLD_PX = 16;

type Rect = { left: number; right: number; top: number; bottom: number };

export type SnapInput = {
    panel: Rect;
    viewport: Rect;
    isRtl: boolean;
};

export function shouldSnapToDock( { panel, viewport, isRtl }: SnapInput ): boolean {
    const distance = isRtl ? panel.left - viewport.left : viewport.right - panel.right;

    return distance <= SNAP_THRESHOLD_PX;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd packages && npx jest packages/core/editor-floating-panels/src/lib/__tests__/snap-to-dock.test.ts
```

Expected: PASS — 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/packages/core/editor-floating-panels/src/lib
git commit -m "feat(editor-floating-panels): snap-to-dock heuristic"
```

---

## Task 4: Store slice + selectors

**Files:**
- Create: `packages/packages/core/editor-floating-panels/src/store/slice.ts`
- Create: `packages/packages/core/editor-floating-panels/src/store/selectors.ts`
- Create: `packages/packages/core/editor-floating-panels/src/store/index.ts`
- Create: `packages/packages/core/editor-floating-panels/src/__tests__/slice.test.ts`

- [ ] **Step 1: Write the failing slice tests**

Create `src/__tests__/slice.test.ts`:

```ts
import { __dispatch, __getState, __registerSlice } from '@elementor/store';

import { slice } from '../store/slice';
import {
    selectIsOpen,
    selectMode,
    selectPanelState,
    selectPosition,
    selectTopZIndex,
} from '../store/selectors';
import { type FloatingPanelDefaults } from '../types';

const defaults: FloatingPanelDefaults = {
    width: 320,
    height: 480,
    minWidth: 240,
    minHeight: 320,
    initialMode: 'docked',
};

describe( 'floating-panels slice', () => {
    beforeEach( () => {
        __registerSlice( slice );
    } );

    it( 'registers a panel with its defaults', () => {
        // Act.
        __dispatch( slice.actions.register( { id: 'a', defaults } ) );

        // Assert.
        const state = selectPanelState( __getState(), 'a' );
        expect( state ).toMatchObject( { isOpen: false, mode: 'docked' } );
        expect( state?.size ).toEqual( { inlineSize: 320, blockSize: 480 } );
    } );

    it( 'opens and closes a panel', () => {
        // Arrange.
        __dispatch( slice.actions.register( { id: 'a', defaults } ) );

        // Act.
        __dispatch( slice.actions.open( 'a' ) );

        // Assert.
        expect( selectIsOpen( __getState(), 'a' ) ).toBe( true );

        // Act.
        __dispatch( slice.actions.close( 'a' ) );

        // Assert.
        expect( selectIsOpen( __getState(), 'a' ) ).toBe( false );
    } );

    it( 'switches dock mode', () => {
        // Arrange.
        __dispatch( slice.actions.register( { id: 'a', defaults } ) );

        // Act.
        __dispatch( slice.actions.setMode( { id: 'a', mode: 'floating' } ) );

        // Assert.
        expect( selectMode( __getState(), 'a' ) ).toBe( 'floating' );
    } );

    it( 'updates position', () => {
        // Arrange.
        __dispatch( slice.actions.register( { id: 'a', defaults } ) );

        // Act.
        __dispatch(
            slice.actions.setPosition( {
                id: 'a',
                position: { insetInlineStart: 200, insetBlockStart: 80 },
            } )
        );

        // Assert.
        expect( selectPosition( __getState(), 'a' ) ).toEqual( {
            insetInlineStart: 200,
            insetBlockStart: 80,
        } );
    } );

    it( 'bringToFront raises zIndex above all others', () => {
        // Arrange.
        __dispatch( slice.actions.register( { id: 'a', defaults } ) );
        __dispatch( slice.actions.register( { id: 'b', defaults } ) );

        // Act.
        __dispatch( slice.actions.bringToFront( 'a' ) );
        __dispatch( slice.actions.bringToFront( 'b' ) );

        // Assert.
        expect( selectTopZIndex( __getState() ) ).toBeGreaterThanOrEqual( 2 );
        const a = selectPanelState( __getState(), 'a' );
        const b = selectPanelState( __getState(), 'b' );
        expect( b!.zIndex ).toBeGreaterThan( a!.zIndex );
    } );
} );
```

- [ ] **Step 2: Run to verify failure**

```bash
cd packages && npx jest packages/core/editor-floating-panels/src/__tests__/slice.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the slice**

Create `src/store/slice.ts`:

```ts
import { __createSlice, type PayloadAction } from '@elementor/store';

import { type DockMode, type FloatingPanelDefaults, type FloatingPanelState, type LogicalPosition } from '../types';

type SliceState = {
    byId: Record< string, FloatingPanelState >;
    topZIndex: number;
};

const initialState: SliceState = {
    byId: {},
    topZIndex: 0,
};

export const slice = __createSlice( {
    name: 'floatingPanels',
    initialState,
    reducers: {
        register( state, action: PayloadAction< { id: string; defaults: FloatingPanelDefaults } > ) {
            const { id, defaults } = action.payload;
            if ( state.byId[ id ] ) {
                return;
            }
            state.byId[ id ] = {
                isOpen: false,
                mode: defaults.initialMode,
                position: defaults.initialPosition ?? { insetInlineStart: 24, insetBlockStart: 80 },
                size: { inlineSize: defaults.width, blockSize: defaults.height },
                zIndex: 0,
            };
        },
        open( state, action: PayloadAction< string > ) {
            const panel = state.byId[ action.payload ];
            if ( panel ) {
                panel.isOpen = true;
            }
        },
        close( state, action: PayloadAction< string > ) {
            const panel = state.byId[ action.payload ];
            if ( panel ) {
                panel.isOpen = false;
            }
        },
        setMode( state, action: PayloadAction< { id: string; mode: DockMode } > ) {
            const panel = state.byId[ action.payload.id ];
            if ( panel ) {
                panel.mode = action.payload.mode;
            }
        },
        setPosition( state, action: PayloadAction< { id: string; position: LogicalPosition } > ) {
            const panel = state.byId[ action.payload.id ];
            if ( panel ) {
                panel.position = action.payload.position;
            }
        },
        setSize(
            state,
            action: PayloadAction< { id: string; size: { inlineSize: number; blockSize: number } } >
        ) {
            const panel = state.byId[ action.payload.id ];
            if ( panel ) {
                panel.size = action.payload.size;
            }
        },
        bringToFront( state, action: PayloadAction< string > ) {
            const panel = state.byId[ action.payload ];
            if ( ! panel ) {
                return;
            }
            state.topZIndex += 1;
            panel.zIndex = state.topZIndex;
        },
    },
} );

export type FloatingPanelsSliceState = SliceState;
```

- [ ] **Step 4: Implement selectors**

Create `src/store/selectors.ts`:

```ts
import { type FloatingPanelsSliceState } from './slice';

type GlobalState = { floatingPanels: FloatingPanelsSliceState };

export function selectPanelState( state: GlobalState, id: string ) {
    return state.floatingPanels.byId[ id ];
}

export function selectIsOpen( state: GlobalState, id: string ): boolean {
    return state.floatingPanels.byId[ id ]?.isOpen ?? false;
}

export function selectMode( state: GlobalState, id: string ) {
    return state.floatingPanels.byId[ id ]?.mode;
}

export function selectPosition( state: GlobalState, id: string ) {
    return state.floatingPanels.byId[ id ]?.position;
}

export function selectSize( state: GlobalState, id: string ) {
    return state.floatingPanels.byId[ id ]?.size;
}

export function selectTopZIndex( state: GlobalState ): number {
    return state.floatingPanels.topZIndex;
}

export function selectOpenPanelIds( state: GlobalState ): string[] {
    return Object.entries( state.floatingPanels.byId )
        .filter( ( [ , panel ] ) => panel.isOpen )
        .sort( ( [ , a ], [ , b ] ) => a.zIndex - b.zIndex )
        .map( ( [ id ] ) => id );
}
```

- [ ] **Step 5: Add the store barrel**

Create `src/store/index.ts`:

```ts
export { slice } from './slice';
export * from './selectors';
```

- [ ] **Step 6: Run tests to verify pass**

```bash
cd packages && npx jest packages/core/editor-floating-panels/src/__tests__/slice.test.ts
```

Expected: PASS — 5 tests pass.

- [ ] **Step 7: Commit**

```bash
git add packages/packages/core/editor-floating-panels/src
git commit -m "feat(editor-floating-panels): store slice + selectors"
```

---

## Task 5: Persistence (per-user state)

Persist state via the existing user preferences mechanism. Read on init; write on every store mutation (debounced 250 ms).

**Files:**
- Create: `packages/packages/core/editor-floating-panels/src/persistence.ts`
- Create: `packages/packages/core/editor-floating-panels/src/__tests__/persistence.test.ts`

- [ ] **Step 1: Write the failing persistence tests**

Create `src/__tests__/persistence.test.ts`:

```ts
import { decodePersistedState, encodePersistedState } from '../persistence';

describe( 'persistence', () => {
    it( 'round-trips a panel state through encode/decode', () => {
        // Arrange.
        const input = {
            'audit-panel': {
                isOpen: true,
                mode: 'docked' as const,
                position: { insetInlineStart: 24, insetBlockStart: 80 },
                size: { inlineSize: 320, blockSize: 480 },
                zIndex: 3,
            },
        };

        // Act.
        const decoded = decodePersistedState( encodePersistedState( input ) );

        // Assert.
        expect( decoded ).toEqual( input );
    } );

    it( 'returns an empty record for non-JSON input', () => {
        expect( decodePersistedState( 'not json' ) ).toEqual( {} );
    } );

    it( 'returns an empty record for null/undefined input', () => {
        expect( decodePersistedState( null ) ).toEqual( {} );
        expect( decodePersistedState( undefined ) ).toEqual( {} );
    } );

    it( 'drops malformed panel entries', () => {
        // Arrange.
        const raw = JSON.stringify( {
            'audit-panel': 'not an object',
            'valid-panel': {
                isOpen: false,
                mode: 'floating',
                position: { insetInlineStart: 10, insetBlockStart: 10 },
                size: { inlineSize: 300, blockSize: 400 },
                zIndex: 1,
            },
        } );

        // Act.
        const decoded = decodePersistedState( raw );

        // Assert.
        expect( decoded[ 'audit-panel' ] ).toBeUndefined();
        expect( decoded[ 'valid-panel' ] ).toBeDefined();
    } );
} );
```

- [ ] **Step 2: Run to verify failure**

```bash
cd packages && npx jest packages/core/editor-floating-panels/src/__tests__/persistence.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement persistence**

Create `src/persistence.ts`:

```ts
import { type FloatingPanelState } from './types';

export const PERSISTENCE_STORAGE_KEY = 'elementor_floating_panels_state';

type PersistedState = Record< string, FloatingPanelState >;

export function encodePersistedState( state: PersistedState ): string {
    return JSON.stringify( state );
}

export function decodePersistedState( raw: string | null | undefined ): PersistedState {
    if ( ! raw ) {
        return {};
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse( raw );
    } catch {
        return {};
    }

    if ( typeof parsed !== 'object' || parsed === null ) {
        return {};
    }

    const result: PersistedState = {};
    for ( const [ id, value ] of Object.entries( parsed as Record< string, unknown > ) ) {
        if ( isPanelState( value ) ) {
            result[ id ] = value;
        }
    }

    return result;
}

function isPanelState( value: unknown ): value is FloatingPanelState {
    if ( typeof value !== 'object' || value === null ) {
        return false;
    }
    const v = value as Record< string, unknown >;
    return (
        typeof v.isOpen === 'boolean' &&
        ( v.mode === 'docked' || v.mode === 'floating' ) &&
        typeof v.position === 'object' &&
        v.position !== null &&
        typeof v.size === 'object' &&
        v.size !== null &&
        typeof v.zIndex === 'number'
    );
}
```

- [ ] **Step 4: Run tests to verify pass**

```bash
cd packages && npx jest packages/core/editor-floating-panels/src/__tests__/persistence.test.ts
```

Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/packages/core/editor-floating-panels/src
git commit -m "feat(editor-floating-panels): persistence encode/decode"
```

---

## Task 6: Location + sync wiring

The sync module mirrors `editor-panels/sync.ts` but is minimal: it just listens for `elementor/panel/init` and ensures the host is mounted. There is no V1-route coupling and no V1-DOM hiding (those were the bits we deliberately left in `editor-panels`).

**Files:**
- Create: `packages/packages/core/editor-floating-panels/src/location.ts`
- Create: `packages/packages/core/editor-floating-panels/src/sync.ts`

- [ ] **Step 1: Implement location**

Create `src/location.ts`:

```ts
import { createLocation } from '@elementor/locations';

import { type FloatingPanelDeclaration } from './types';

export const { inject: injectIntoFloatingPanels, useInjections: useFloatingPanelsInjections } =
    createLocation< Pick< FloatingPanelDeclaration, 'id' | 'component' | 'icon' | 'title' > >();
```

- [ ] **Step 2: Implement sync**

Create `src/sync.ts`:

```ts
import {
    __privateListenTo as listenTo,
    windowEvent,
} from '@elementor/editor-v1-adapters';
import { __getState, __subscribe } from '@elementor/store';

import { decodePersistedState, encodePersistedState, PERSISTENCE_STORAGE_KEY } from './persistence';
import { selectPanelState } from './store/selectors';
import { slice } from './store/slice';
import { __dispatch } from '@elementor/store';

const PERSIST_DEBOUNCE_MS = 250;

declare global {
    interface Window {
        elementor?: {
            getPreferences?: ( key: string ) => unknown;
            setPreferences?: ( key: string, value: unknown ) => void;
        };
    }
}

export function sync(): void {
    listenTo( windowEvent( 'elementor/panel/init' ), restorePersistedState );
    schedulePersistence();
}

function restorePersistedState(): void {
    const raw = window.elementor?.getPreferences?.( PERSISTENCE_STORAGE_KEY );
    const state = decodePersistedState( typeof raw === 'string' ? raw : null );

    for ( const [ id, panel ] of Object.entries( state ) ) {
        __dispatch( slice.actions.register( {
            id,
            defaults: {
                width: panel.size.inlineSize,
                height: panel.size.blockSize,
                minWidth: 200,
                minHeight: 200,
                initialMode: panel.mode,
                initialPosition: panel.position,
            },
        } ) );
        if ( panel.isOpen ) {
            __dispatch( slice.actions.open( id ) );
        }
    }
}

function schedulePersistence(): void {
    let timer: ReturnType< typeof setTimeout > | null = null;

    __subscribe( () => {
        if ( timer ) {
            clearTimeout( timer );
        }
        timer = setTimeout( persistNow, PERSIST_DEBOUNCE_MS );
    } );
}

function persistNow(): void {
    const state = __getState() as { floatingPanels?: { byId?: Record< string, ReturnType< typeof selectPanelState > > } };
    const byId = state.floatingPanels?.byId ?? {};
    window.elementor?.setPreferences?.(
        PERSISTENCE_STORAGE_KEY,
        encodePersistedState( byId as Parameters< typeof encodePersistedState >[ 0 ] )
    );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd packages && npx tsc --noEmit -p packages/core/editor-floating-panels/tsconfig.json
```

If no per-package tsconfig exists, run the root `npm run lint` (which includes tsc) instead:

```bash
cd packages && npm run lint
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add packages/packages/core/editor-floating-panels/src
git commit -m "feat(editor-floating-panels): location + persistence sync"
```

---

## Task 7: createFloatingPanel + registerFloatingPanel API

**Files:**
- Create: `packages/packages/core/editor-floating-panels/src/api.ts`
- Create: `packages/packages/core/editor-floating-panels/src/hooks/use-floating-panel-status.ts`
- Create: `packages/packages/core/editor-floating-panels/src/hooks/use-floating-panel-actions.ts`

- [ ] **Step 1: Implement the status hook**

Create `src/hooks/use-floating-panel-status.ts`:

```ts
import { __useSelector as useSelector } from '@elementor/store';

import { selectMode, selectIsOpen, selectPosition, selectSize } from '../store/selectors';

export function useFloatingPanelStatus( id: string ) {
    const isOpen = useSelector( ( state ) => selectIsOpen( state, id ) );
    const mode = useSelector( ( state ) => selectMode( state, id ) );
    const position = useSelector( ( state ) => selectPosition( state, id ) );
    const size = useSelector( ( state ) => selectSize( state, id ) );

    return { isOpen, mode, position, size };
}
```

- [ ] **Step 2: Implement the actions hook**

Create `src/hooks/use-floating-panel-actions.ts`:

```ts
import { __useDispatch as useDispatch } from '@elementor/store';

import { slice } from '../store/slice';
import { type DockMode, type LogicalPosition } from '../types';

export function useFloatingPanelActions( id: string ) {
    const dispatch = useDispatch();

    return {
        open: () => {
            dispatch( slice.actions.open( id ) );
            dispatch( slice.actions.bringToFront( id ) );
        },
        close: () => dispatch( slice.actions.close( id ) ),
        toggle: () => {
            dispatch( slice.actions.bringToFront( id ) );
        },
        setMode: ( mode: DockMode ) => dispatch( slice.actions.setMode( { id, mode } ) ),
        setPosition: ( position: LogicalPosition ) =>
            dispatch( slice.actions.setPosition( { id, position } ) ),
        focus: () => dispatch( slice.actions.bringToFront( id ) ),
    };
}
```

Note: `toggle` doesn't actually toggle yet — that needs both status and actions. We'll wire it correctly in the next step.

- [ ] **Step 3: Implement the createFloatingPanel API**

Create `src/api.ts`:

```ts
import { __dispatch as dispatch } from '@elementor/store';

import { useFloatingPanelActions } from './hooks/use-floating-panel-actions';
import { useFloatingPanelStatus } from './hooks/use-floating-panel-status';
import { injectIntoFloatingPanels } from './location';
import { slice } from './store/slice';
import { type FloatingPanelDeclaration } from './types';

export function createFloatingPanel( declaration: FloatingPanelDeclaration ) {
    dispatch( slice.actions.register( { id: declaration.id, defaults: declaration.defaults } ) );

    return {
        panel: declaration,
        useFloatingPanelStatus: () => useFloatingPanelStatus( declaration.id ),
        useFloatingPanelActions: () => {
            const actions = useFloatingPanelActions( declaration.id );
            const { isOpen } = useFloatingPanelStatus( declaration.id );
            return {
                ...actions,
                toggle: () => ( isOpen ? actions.close() : actions.open() ),
            };
        },
    };
}

export function registerFloatingPanel(
    declaration: Pick< FloatingPanelDeclaration, 'id' | 'component' | 'icon' | 'title' >
): void {
    injectIntoFloatingPanels( declaration );
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/packages/core/editor-floating-panels/src
git commit -m "feat(editor-floating-panels): public API + status/actions hooks"
```

---

## Task 8: Drag hook

**Files:**
- Create: `packages/packages/core/editor-floating-panels/src/hooks/use-floating-panel-drag.ts`

- [ ] **Step 1: Implement the drag hook**

Create `src/hooks/use-floating-panel-drag.ts`:

```ts
import { useCallback, useRef } from 'react';

import { applyDragDelta, physicalToLogicalDelta } from '../lib/drag-math';
import { isRtl } from '../lib/direction';
import { SNAP_THRESHOLD_PX, shouldSnapToDock } from '../lib/snap-to-dock';
import { type LogicalPosition } from '../types';

import { useFloatingPanelActions } from './use-floating-panel-actions';
import { useFloatingPanelStatus } from './use-floating-panel-status';

type DragSession = {
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startPosition: LogicalPosition;
};

export function useFloatingPanelDrag( id: string ) {
    const sessionRef = useRef< DragSession | null >( null );
    const { position, mode } = useFloatingPanelStatus( id );
    const { setPosition, setMode } = useFloatingPanelActions( id );

    const onPointerDown = useCallback(
        ( event: React.PointerEvent< HTMLElement > ) => {
            if ( mode !== 'floating' ) {
                return;
            }
            ( event.target as HTMLElement ).setPointerCapture( event.pointerId );
            sessionRef.current = {
                pointerId: event.pointerId,
                startClientX: event.clientX,
                startClientY: event.clientY,
                startPosition: position ?? { insetInlineStart: 0, insetBlockStart: 0 },
            };
        },
        [ mode, position ]
    );

    const onPointerMove = useCallback(
        ( event: React.PointerEvent< HTMLElement > ) => {
            const session = sessionRef.current;
            if ( ! session || session.pointerId !== event.pointerId ) {
                return;
            }
            const physical = { dx: event.clientX - session.startClientX, dy: event.clientY - session.startClientY };
            const logical = physicalToLogicalDelta( physical, isRtl() );
            setPosition( applyDragDelta( session.startPosition, logical ) );
        },
        [ setPosition ]
    );

    const onPointerUp = useCallback(
        ( event: React.PointerEvent< HTMLElement > ) => {
            const session = sessionRef.current;
            if ( ! session || session.pointerId !== event.pointerId ) {
                return;
            }
            sessionRef.current = null;
            const target = event.target as HTMLElement;
            const panelRect = target.closest< HTMLElement >( '[data-floating-panel]' )?.getBoundingClientRect();
            if ( panelRect ) {
                const viewportRect = {
                    left: 0,
                    right: window.innerWidth,
                    top: 0,
                    bottom: window.innerHeight,
                };
                if (
                    shouldSnapToDock( {
                        panel: { left: panelRect.left, right: panelRect.right, top: panelRect.top, bottom: panelRect.bottom },
                        viewport: viewportRect,
                        isRtl: isRtl(),
                    } )
                ) {
                    setMode( 'docked' );
                }
            }
        },
        [ setMode ]
    );

    return { onPointerDown, onPointerMove, onPointerUp, snapThreshold: SNAP_THRESHOLD_PX };
}
```

- [ ] **Step 2: Lint passes**

```bash
cd packages && npm run lint
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/packages/core/editor-floating-panels/src
git commit -m "feat(editor-floating-panels): drag hook"
```

---

## Task 9: Internal components — panel window + drag handle

**Files:**
- Create: `packages/packages/core/editor-floating-panels/src/components/internal/panel-window.tsx`
- Create: `packages/packages/core/editor-floating-panels/src/components/internal/drag-handle.tsx`

- [ ] **Step 1: Implement the drag handle**

Create `src/components/internal/drag-handle.tsx`:

```tsx
import * as React from 'react';
import { Box } from '@elementor/ui';

import { useFloatingPanelDrag } from '../../hooks/use-floating-panel-drag';

type Props = {
    panelId: string;
    children: React.ReactNode;
};

export default function DragHandle( { panelId, children }: Props ) {
    const { onPointerDown, onPointerMove, onPointerUp } = useFloatingPanelDrag( panelId );

    return (
        <Box
            onPointerDown={ onPointerDown }
            onPointerMove={ onPointerMove }
            onPointerUp={ onPointerUp }
            sx={ { cursor: 'move', touchAction: 'none', flex: 1 } }
        >
            { children }
        </Box>
    );
}
```

- [ ] **Step 2: Implement the panel window**

Create `src/components/internal/panel-window.tsx`:

```tsx
import * as React from 'react';
import { Box, Paper } from '@elementor/ui';

import { useFloatingPanelStatus } from '../../hooks/use-floating-panel-status';

type Props = {
    panelId: string;
    zIndex: number;
    onFocus: () => void;
    children: React.ReactNode;
};

export default function PanelWindow( { panelId, zIndex, onFocus, children }: Props ) {
    const { mode, position, size } = useFloatingPanelStatus( panelId );

    if ( ! position || ! size ) {
        return null;
    }

    const dockedSx = {
        position: 'fixed' as const,
        insetInlineEnd: 0,
        insetBlockStart: 'var(--e-editor-app-bar-height, 60px)',
        insetBlockEnd: 0,
        inlineSize: `${ size.inlineSize }px`,
        zIndex,
    };

    const floatingSx = {
        position: 'fixed' as const,
        insetInlineStart: `${ position.insetInlineStart }px`,
        insetBlockStart: `${ position.insetBlockStart }px`,
        inlineSize: `${ size.inlineSize }px`,
        blockSize: `${ size.blockSize }px`,
        zIndex,
    };

    return (
        <Paper
            data-floating-panel={ panelId }
            elevation={ mode === 'floating' ? 8 : 0 }
            role="dialog"
            aria-label={ panelId }
            onMouseDown={ onFocus }
            sx={ {
                ...( mode === 'docked' ? dockedSx : floatingSx ),
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.default',
            } }
        >
            <Box sx={ { display: 'flex', flexDirection: 'column', height: '100%' } }>{ children }</Box>
        </Paper>
    );
}
```

- [ ] **Step 3: Lint and commit**

```bash
cd packages && npm run lint
```

Expected: PASS.

```bash
git add packages/packages/core/editor-floating-panels/src
git commit -m "feat(editor-floating-panels): panel window + drag handle internals"
```

---

## Task 10: External components

**Files:**
- Create: `packages/packages/core/editor-floating-panels/src/components/external/floating-panel.tsx`
- Create: `packages/packages/core/editor-floating-panels/src/components/external/floating-panel-header.tsx`
- Create: `packages/packages/core/editor-floating-panels/src/components/external/floating-panel-body.tsx`
- Create: `packages/packages/core/editor-floating-panels/src/components/external/floating-panel-footer.tsx`
- Create: `packages/packages/core/editor-floating-panels/src/components/external/index.ts`

- [ ] **Step 1: Floating panel header**

Create `src/components/external/floating-panel-header.tsx`:

```tsx
import * as React from 'react';
import { Box, IconButton, Typography } from '@elementor/ui';
import { XIcon } from '@elementor/icons';

import DragHandle from '../internal/drag-handle';
import { useFloatingPanelActions } from '../../hooks/use-floating-panel-actions';

type Props = {
    panelId: string;
    title: string;
    icon?: React.ComponentType;
};

export default function FloatingPanelHeader( { panelId, title, icon: Icon }: Props ) {
    const { close } = useFloatingPanelActions( panelId );

    return (
        <Box
            sx={ {
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 1,
                borderBottom: 1,
                borderColor: 'divider',
            } }
        >
            <DragHandle panelId={ panelId }>
                <Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
                    { Icon ? <Icon /> : null }
                    <Typography variant="subtitle2" component="h2">{ title }</Typography>
                </Box>
            </DragHandle>
            <IconButton size="small" aria-label="Close panel" onClick={ close }>
                <XIcon />
            </IconButton>
        </Box>
    );
}
```

Note: the docked/floating toggle button is intentionally not in v1. Users dock by dragging the panel near the inline-end edge (snap-to-dock from Task 8); they undock by dragging from the docked position. A dedicated toggle button is in "Out of scope (deferred)".

- [ ] **Step 2: Floating panel body**

Create `src/components/external/floating-panel-body.tsx`:

```tsx
import * as React from 'react';
import { Box, type BoxProps } from '@elementor/ui';

export default function FloatingPanelBody( props: BoxProps ) {
    return (
        <Box
            { ...props }
            sx={ {
                flex: 1,
                overflowY: 'auto',
                padding: 2,
                ...( props.sx ?? {} ),
            } }
        />
    );
}
```

- [ ] **Step 3: Floating panel footer**

Create `src/components/external/floating-panel-footer.tsx`:

```tsx
import * as React from 'react';
import { Box, type BoxProps } from '@elementor/ui';

export default function FloatingPanelFooter( props: BoxProps ) {
    return (
        <Box
            { ...props }
            sx={ {
                px: 2,
                py: 1.5,
                borderTop: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                ...( props.sx ?? {} ),
            } }
        />
    );
}
```

- [ ] **Step 4: Floating panel composite**

Create `src/components/external/floating-panel.tsx`:

```tsx
import * as React from 'react';

type Props = {
    children: React.ReactNode;
};

export default function FloatingPanel( { children }: Props ) {
    return <>{ children }</>;
}
```

The composite is intentionally a fragment — the wrapping window/positioning lives in the internal `PanelWindow` component, which is rendered by the host. Consumers compose with `<FloatingPanelHeader />`, `<FloatingPanelBody />`, `<FloatingPanelFooter />` inside their panel component.

- [ ] **Step 5: Barrel exports**

Create `src/components/external/index.ts`:

```ts
export { default as FloatingPanel } from './floating-panel';
export { default as FloatingPanelHeader } from './floating-panel-header';
export { default as FloatingPanelBody } from './floating-panel-body';
export { default as FloatingPanelFooter } from './floating-panel-footer';
```

- [ ] **Step 6: Lint and commit**

```bash
cd packages && npm run lint
```

Expected: PASS.

```bash
git add packages/packages/core/editor-floating-panels/src
git commit -m "feat(editor-floating-panels): external component primitives"
```

---

## Task 11: Host component

**Files:**
- Create: `packages/packages/core/editor-floating-panels/src/components/internal/host.tsx`

- [ ] **Step 1: Implement the host with ESC-to-close**

Create `src/components/internal/host.tsx`:

```tsx
import * as React from 'react';
import { __useDispatch as useDispatch, __useSelector as useSelector } from '@elementor/store';

import { useFloatingPanelsInjections } from '../../location';
import { selectOpenPanelIds, selectPanelState, selectTopZIndex } from '../../store/selectors';
import { slice } from '../../store/slice';
import PanelWindow from './panel-window';

export default function FloatingPanelsHost() {
    const openIds = useSelector( selectOpenPanelIds );
    const topZIndex = useSelector( selectTopZIndex );
    const injections = useFloatingPanelsInjections();
    const dispatch = useDispatch();

    const declarationById = React.useMemo( () => {
        return Object.fromEntries(
            injections.default.map( ( inj ) => [ inj.id, inj ] )
        );
    }, [ injections ] );

    React.useEffect( () => {
        function onKeyDown( event: KeyboardEvent ) {
            if ( event.key !== 'Escape' ) {
                return;
            }
            // Close only the currently top-most (focused) open panel.
            const focusedId = openIds[ openIds.length - 1 ];
            if ( focusedId ) {
                dispatch( slice.actions.close( focusedId ) );
            }
        }

        document.addEventListener( 'keydown', onKeyDown );
        return () => document.removeEventListener( 'keydown', onKeyDown );
    }, [ openIds, dispatch ] );

    return (
        <>
            { openIds.map( ( id ) => {
                const declaration = declarationById[ id ];
                if ( ! declaration ) {
                    return null;
                }
                const Component = declaration.component;
                return (
                    <HostedPanel
                        key={ id }
                        id={ id }
                        topZIndex={ topZIndex }
                        onFocus={ () => dispatch( slice.actions.bringToFront( id ) ) }
                    >
                        <Component />
                    </HostedPanel>
                );
            } ) }
        </>
    );
}

function HostedPanel( {
    id,
    children,
    onFocus,
    topZIndex,
}: {
    id: string;
    children: React.ReactNode;
    onFocus: () => void;
    topZIndex: number;
} ) {
    const panel = useSelector( ( state ) => selectPanelState( state, id ) );
    if ( ! panel ) {
        return null;
    }
    return (
        <PanelWindow panelId={ id } zIndex={ 1000 + panel.zIndex } onFocus={ onFocus }>
            { children }
        </PanelWindow>
    );
}
```

- [ ] **Step 2: Write a test for ESC-to-close**

Create `src/__tests__/host.test.tsx`:

```tsx
import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { __createStore, __deleteStore, __dispatch, __registerSlice, __StoreProvider as StoreProvider } from '@elementor/store';
import { fireEvent, screen } from '@testing-library/react';

import FloatingPanelsHost from '../components/internal/host';
import { injectIntoFloatingPanels } from '../location';
import { slice } from '../store/slice';

describe( 'FloatingPanelsHost', () => {
    beforeEach( () => {
        __registerSlice( slice );
        __createStore();
    } );

    afterEach( () => {
        __deleteStore();
    } );

    it( 'closes the top-most open panel on ESC', () => {
        // Arrange.
        const PanelA = () => <div>Panel A body</div>;
        injectIntoFloatingPanels( { id: 'a', component: PanelA, icon: () => null, title: 'A' } );
        __dispatch( slice.actions.register( {
            id: 'a',
            defaults: { width: 200, height: 300, minWidth: 100, minHeight: 100, initialMode: 'floating' },
        } ) );
        __dispatch( slice.actions.open( 'a' ) );
        __dispatch( slice.actions.bringToFront( 'a' ) );

        renderWithTheme(
            <StoreProvider>
                <FloatingPanelsHost />
            </StoreProvider>
        );

        // Assert.
        expect( screen.getByText( 'Panel A body' ) ).toBeInTheDocument();

        // Act.
        fireEvent.keyDown( document, { key: 'Escape' } );

        // Assert.
        expect( screen.queryByText( 'Panel A body' ) ).not.toBeInTheDocument();
    } );
} );
```

- [ ] **Step 3: Run the host tests**

```bash
cd packages && npx jest packages/core/editor-floating-panels/src/__tests__/host.test.tsx
```

Expected: PASS — 1 test.

- [ ] **Step 4: Lint and commit**

```bash
cd packages && npm run lint
```

Expected: PASS.

```bash
git add packages/packages/core/editor-floating-panels/src
git commit -m "feat(editor-floating-panels): host renders open panels + ESC-to-close"
```

---

## Task 12: init() + public exports

**Files:**
- Modify: `packages/packages/core/editor-floating-panels/src/init.ts`
- Modify: `packages/packages/core/editor-floating-panels/src/index.ts`

- [ ] **Step 1: Implement init**

Create `src/init.ts`:

```ts
import { injectIntoTop } from '@elementor/editor';
import { __registerSlice } from '@elementor/store';

import FloatingPanelsHost from './components/internal/host';
import { slice } from './store/slice';
import { sync } from './sync';

export function init() {
    __registerSlice( slice );
    sync();
    injectIntoTop( { id: 'floating-panels', component: FloatingPanelsHost } );
}
```

- [ ] **Step 2: Expose public API**

Replace `src/index.ts`:

```ts
export { init } from './init';
export { createFloatingPanel, registerFloatingPanel } from './api';
export * from './components/external';
export { useFloatingPanelStatus } from './hooks/use-floating-panel-status';
export { useFloatingPanelActions } from './hooks/use-floating-panel-actions';
export type {
    DockMode,
    FloatingPanelDeclaration,
    FloatingPanelDefaults,
    FloatingPanelState,
    LogicalPosition,
    LogicalSize,
} from './types';
```

- [ ] **Step 3: Lint passes**

```bash
cd packages && npm run lint
```

Expected: PASS.

- [ ] **Step 4: Build passes**

```bash
npm run build:packages
```

Expected: PASS — `dist/` contains `index.{js,mjs,d.ts}`.

- [ ] **Step 5: Commit**

```bash
git add packages/packages/core/editor-floating-panels/src
git commit -m "feat(editor-floating-panels): init + public exports"
```

---

## Task 13: API integration test

End-to-end-ish test using `@testing-library/react` to verify open/close/dock-toggle behavior of a panel registered through the public API.

**Files:**
- Create: `packages/packages/core/editor-floating-panels/src/__tests__/api.test.tsx`

- [ ] **Step 1: Write the integration test**

Create the file. Use `test-utils.renderWithTheme` like the `editor-panels` tests:

```tsx
import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { __createStore, __deleteStore, __registerSlice, __StoreProvider as StoreProvider } from '@elementor/store';
import { act, fireEvent, screen } from '@testing-library/react';

import { createFloatingPanel, registerFloatingPanel } from '../api';
import { FloatingPanelBody, FloatingPanelHeader } from '../components/external';
import FloatingPanelsHost from '../components/internal/host';
import { slice } from '../store/slice';

function MockPanelComponent() {
    return (
        <>
            <FloatingPanelHeader panelId="test-panel" title="Test Panel" />
            <FloatingPanelBody>Body content</FloatingPanelBody>
        </>
    );
}

function createMockPanel() {
    return createFloatingPanel( {
        id: 'test-panel',
        title: 'Test Panel',
        icon: () => null,
        component: MockPanelComponent,
        defaults: {
            width: 320,
            height: 480,
            minWidth: 240,
            minHeight: 320,
            initialMode: 'floating',
            initialPosition: { insetInlineStart: 24, insetBlockStart: 80 },
        },
    } );
}

describe( 'floating-panels api', () => {
    beforeEach( () => {
        __registerSlice( slice );
        __createStore();
    } );

    afterEach( () => {
        __deleteStore();
    } );

    it( 'does not render a panel that was never registered', () => {
        // Arrange.
        createMockPanel();

        // Act.
        renderWithTheme(
            <StoreProvider>
                <FloatingPanelsHost />
            </StoreProvider>
        );

        // Assert.
        expect( screen.queryByText( 'Body content' ) ).not.toBeInTheDocument();
    } );

    it( 'opens and closes a registered panel', () => {
        // Arrange.
        const mock = createMockPanel();
        registerFloatingPanel( mock.panel );

        function OpenButton() {
            const { open, close } = mock.useFloatingPanelActions();
            return (
                <>
                    <button onClick={ open }>Open</button>
                    <button onClick={ close }>Close</button>
                </>
            );
        }

        renderWithTheme(
            <StoreProvider>
                <OpenButton />
                <FloatingPanelsHost />
            </StoreProvider>
        );

        // Act.
        act( () => {
            fireEvent.click( screen.getByText( 'Open' ) );
        } );

        // Assert.
        expect( screen.getByText( 'Body content' ) ).toBeInTheDocument();

        // Act.
        act( () => {
            fireEvent.click( screen.getByText( 'Close' ) );
        } );

        // Assert.
        expect( screen.queryByText( 'Body content' ) ).not.toBeInTheDocument();
    } );
} );
```

- [ ] **Step 2: Run the test**

```bash
cd packages && npx jest packages/core/editor-floating-panels/src/__tests__/api.test.tsx
```

Expected: PASS — 2 tests.

If `test-utils` or `renderWithTheme` is unavailable in your environment, substitute with the patterns used in `editor-panels/__tests__/api.test.tsx`.

- [ ] **Step 3: Commit**

```bash
git add packages/packages/core/editor-floating-panels/src/__tests__
git commit -m "test(editor-floating-panels): api integration test"
```

---

## Task 14: Final checks

- [ ] **Step 1: Run the full lint + test pipeline**

From the repo root:

```bash
cd packages && npm run lint && npx jest packages/core/editor-floating-panels
```

Expected: PASS for both.

- [ ] **Step 2: Build the package**

```bash
npm run build:packages
```

Expected: PASS. Confirm `packages/packages/core/editor-floating-panels/dist/index.d.ts` exports the documented types.

- [ ] **Step 3: README**

Update `README.md` with a minimal usage example:

```markdown
# @elementor/editor-floating-panels

Generic floating + dockable React panel framework for the Elementor editor.

## Usage

\`\`\`ts
import { createFloatingPanel, registerFloatingPanel, FloatingPanelBody, FloatingPanelHeader } from '@elementor/editor-floating-panels';

const myPanel = createFloatingPanel( {
    id: 'my-panel',
    title: 'My Panel',
    icon: MyIcon,
    component: MyPanelComponent,
    defaults: {
        width: 320,
        height: 480,
        minWidth: 240,
        minHeight: 320,
        initialMode: 'docked',
    },
} );

registerFloatingPanel( myPanel.panel );
\`\`\`

See `docs/superpowers/specs/2026-05-28-editor-audit-panel-design.md` §6 for the design.
```

- [ ] **Step 4: Commit**

```bash
git add packages/packages/core/editor-floating-panels/README.md
git commit -m "docs(editor-floating-panels): add usage example to README"
```

---

## Acceptance criteria

- Package builds cleanly via `npm run build:packages`.
- All tests pass: `cd packages && npx jest packages/core/editor-floating-panels`.
- Lint passes: `cd packages && npm run lint`.
- The package exports `createFloatingPanel`, `registerFloatingPanel`, `init`, the four external components, the two hooks, and the documented types.
- A panel registered via the API renders into the host, can be opened/closed/dragged/docked, and its state persists across reloads via `window.elementor.setPreferences`.
- All direction-sensitive layout uses CSS logical properties; the only physical-to-logical conversion lives in `lib/drag-math.ts`.
- No file exceeds 300 lines.

## Out of scope (deferred)

- Wiring the package into the Elementor editor bootstrap (`assets/dev/js/editor` or wherever the modern packages get `init()` called). That happens in plan 3 when the audit feature is integrated.
- Resize handles. v1 ships drag + drag-to-snap docking; resize is a follow-up.
- Dedicated dock-toggle button in the header. Drag-to-snap covers v1's docking UX; a button-based toggle awaits agreed icon assets.
- Keyboard arrow-key dragging when the drag handle has focus. Real a11y win, real implementation cost; deferred consistent with the spec's other a11y deferrals.
- Mobile/small-viewport forced-dock behavior. Documented in the spec; not implemented in v1 plans.
- Reduced-motion behavior.
