# Editor Floating Panels

> [!WARNING]
> This package is under development and not ready for production use.

A generic floating + dockable React panel framework for the Elementor editor. It
provides the primitives used by feature packages (for example, the editor audit
feature) to render panels that can float over the canvas or dock to the editor
chrome, independent of any specific feature concern.

See the design spec at
[`docs/superpowers/specs/2026-05-28-editor-audit-panel-design.md`](../../../../docs/superpowers/specs/2026-05-28-editor-audit-panel-design.md)
for the motivation, requirements, and intended consumers.

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
	defaults: {
		width: 320,
		height: 480,
		minWidth: 240,
		minHeight: 320,
		initialMode: 'docked',
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

Call `init()` once during editor bootstrap to register the slice, sync persisted state, and mount the host into the editor's top location.

## Persistence

Panel state (open/closed, mode, position, size, z-index) is persisted via a
`PanelStateStorage` adapter. The default implementation uses `localStorage`, so
state survives reloads on the same browser. Pass a custom adapter to `sync()`
to swap in a server-side store.

See `docs/superpowers/specs/2026-05-28-editor-audit-panel-design.md` §6 for the
design.
