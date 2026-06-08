# Editor Floating Panels

A generic floating panel framework for the Elementor editor. It provides the primitives used by feature packages to render panels that float over the canvas and can be dragged freely within the viewport, independent of any specific feature concern.

## Usage

```ts
import {
	createFloatingPanel,
	FloatingPanelBody,
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
			<FloatingPanelHeader panelId="my-panel" title="My Panel" />
			<FloatingPanelBody>Body content</FloatingPanelBody>
		</>
	);
}
```

### `isDraggable`

When `isDraggable` is `true`, the panel header acts as a drag handle — the user can reposition the panel freely. When `false` (the default), the header renders without drag interaction and the panel stays at its `initialPosition`.

Programmatic positioning via `setPosition` from `useFloatingPanelActions` works regardless of `isDraggable`.

Call `init()` once during editor bootstrap to register the slice, sync persisted state, and mount the host into the editor's top location.

## Persistence

Panel state (open/closed, position, size, z-index) is persisted via a
`PanelStateStorage` adapter. The default implementation uses `localStorage`, so
state survives reloads on the same browser. Pass a custom adapter to `sync()`
to swap in a server-side store.
