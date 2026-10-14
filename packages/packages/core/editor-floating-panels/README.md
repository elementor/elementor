# Editor Floating Panels

A generic floating panel framework for the Elementor Editor that provides the primitives for rendering panels on the canvas. The panels can be dragged and resized freely within the viewport, independent of any specific feature concern.

The panes are persisted and survive reloads. The state stores open/closed, position, size, and z-index in `localStorage`.

## Usage

```ts
import {
	createFloatingPanel,
	init,
	registerFloatingPanel,

	FloatingPanelBody,
	FloatingPanelFooter,
	FloatingPanelHeader,
} from '@elementor/editor-floating-panels';

init();

const myPanel = createFloatingPanel( {
	id: 'my-panel',
	title: 'My Panel',
	icon: MyIcon,
	component: MyPanelComponent,
	isDraggable: true,
	isResizable: true,
	defaults: {
		width: 320,
		height: 480,
		minWidth: 240,
		minHeight: 320,
		corner: 'block-start-inline-start',
		initialPosition: {
			insetBlockStart: 80,
			insetInlineStart: 200
		},
	},
} );

registerFloatingPanel( myPanel.panel );

function MyPanelComponent() {
	return (
		<>
			<FloatingPanelHeader
				panelId="my-panel"
				title="My Panel"
				actions={ [ /* ... */ ] }
			/>
			<FloatingPanelBody>
				{ /* ... */ }
			</FloatingPanelBody>
			<FloatingPanelFooter>
				{ /* ... */ }
			</FloatingPanelFooter>
		</>
	);
}
```

### `isDraggable`

When `isDraggable` is `true`, the panel header acts as a drag handle — the user can reposition the panel freely. When `false` (the default), the header renders without drag interaction and the panel stays at its `initialPosition` (see `defaults.initialPosition`).

Programmatic positioning via `setPosition` from `useFloatingPanelActions` works regardless of `isDraggable`.

### `isResizable`

When `isResizable` is `true`, edge and corner resize handles render on the panel — the user can resize freely within the viewport and the minimums defined in `defaults` (`minWidth` / `minHeight`). When `false` (the default), no resize handles render and the panel stays at its declared or persisted size.

Programmatic sizing via `setSize` from `useFloatingPanelActions` works regardless of `isResizable`.

### `defaults`

`defaults` is required and defines the panel's initial dimensions and (optionally) its initial position.

| Field | Purpose |
| ----- | ------- |
| `width` | Initial panel width (in pixels). |
| `height` | Initial panel height (in pixels). |
| `minWidth` | Minimum width the panel can be resized to. |
| `minHeight` | Minimum height the panel can be resized to. |
| `corner` (optional) | Viewport corner anchor. One of `block-start-inline-start`, `block-start-inline-end`, `block-end-inline-start`, `block-end-inline-end`. Default: `block-start-inline-start`. |
| `initialPosition` (optional) | Offsets on the two insets that match `corner`. Used only when no persisted position exists. Other keys are ignored. |

Sizes use physical names (`width`/`height`) because Elementor renders in horizontal writing mode only. Position uses logical inset names because it is direction-sensitive (e.g. RTL).

`LogicalPosition` stores all four insets (`insetInlineStart`, `insetInlineEnd`, `insetBlockStart`, `insetBlockEnd`). Only the pair matching `corner` is used for rendering and interaction; inactive insets are `0`.

| `corner` | Active insets | Default `initialPosition` |
| --- | --- | --- |
| `block-start-inline-start` | `insetInlineStart`, `insetBlockStart` | `{ insetInlineStart: 24, insetBlockStart: 80 }` |
| `block-start-inline-end` | `insetInlineEnd`, `insetBlockStart` | `{ insetInlineEnd: 24, insetBlockStart: 80 }` |
| `block-end-inline-start` | `insetInlineStart`, `insetBlockEnd` | `{ insetInlineStart: 24, insetBlockEnd: 80 }` |
| `block-end-inline-end` | `insetInlineEnd`, `insetBlockEnd` | `{ insetInlineEnd: 24, insetBlockEnd: 80 }` |

Example for bottom-right anchoring:

```ts
defaults: {
	width: 360,
	height: 600,
	minWidth: 280,
	minHeight: 400,
	corner: 'block-end-inline-end',
	initialPosition: {
		insetBlockEnd: 80,
		insetInlineEnd: 24
	},
}
```

When persisted state exists, the persisted `position`, `corner`, and `size` override `initialPosition`, `corner`, `width`, and `height`. The resize minimums (`minWidth`/`minHeight`) are always derived from `defaults`.

Call `init()` once during editor bootstrap, **before** any `createFloatingPanel` call, to register the slice, sync persisted state, and mount the host into the editor's top location.
