# Editor Floating Panels

A generic floating panel framework for the Elementor editor. It provides the primitives used by feature packages to render panels that float over the canvas and can be dragged and resized freely within the viewport, independent of any specific feature concern.

## Usage

```ts
import {
	createFloatingPanel,
	FloatingPanelBody,
	FloatingPanelFooter,
	FloatingPanelHeader,
	registerFloatingPanel,
} from '@elementor/editor-floating-panels';

const myPanel = createFloatingPanel( {
	id: 'my-panel',
	title: 'My Panel',
	icon: MyIcon,
	component: MyPanelComponent,
	isDraggable: true,
	defaults: {
		width: 320,
		height: 480,
		minWidth: 240,
		minHeight: 320,
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

### `defaults`

`defaults` is required and defines the panel's initial dimensions and (optionally) its initial position.

| Field | Purpose |
| ----- | ------- |
| `width` | Initial panel width (in pixels). |
| `height` | Initial panel height (in pixels). |
| `minWidth` | Minimum width the panel can be resized to. |
| `minHeight` | Minimum height the panel can be resized to. |
| `initialPosition` (optional) | Initial position, expressed as logical insets `{ insetInlineStart, insetBlockStart }`. Used only when no persisted position exists. Defaults to `{ insetInlineStart: 24, insetBlockStart: 80 }`. |

Sizes use physical names (`width`/`height`) because Elementor renders in horizontal writing mode only. Position uses logical inset names because it is direction-sensitive (e.g. RTL).

When persisted state exists, the persisted `position` and `size` override `initialPosition`, `width`, and `height`. The resize minimums (`minWidth`/`minHeight`) are always derived from `defaults`.

### `isDraggable`

When `isDraggable` is `true`, the panel header acts as a drag handle — the user can reposition the panel freely. When `false` (the default), the header renders without drag interaction and the panel stays at its `initialPosition` (see `defaults.initialPosition`).

Programmatic positioning via `setPosition` from `useFloatingPanelActions` works regardless of `isDraggable`.

Call `init()` once during editor bootstrap to register the slice, sync persisted state, and mount the host into the editor's top location.

## Persistence

Panel state (open/closed, position, size, z-index) is persisted via a
`PanelStateStorage` adapter. The default implementation uses `localStorage`, so
state survives reloads on the same browser. Pass a custom adapter to `sync()`
to swap in a server-side store.
