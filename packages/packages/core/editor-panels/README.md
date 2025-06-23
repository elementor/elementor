# Editor Panels

> [!WARNING]
> This package is under development and not ready for production use.

## Usage

Creating panel contains 3 steps:

1. Creating the panel component

```tsx
// components/my-panel.tsx
import { Panel, PanelHeader, PanelHeaderTitle, PanelBody } from '@elementor/editor-panels';

export default function MyPanel() {
	return (
		<Panel>
			<PanelHeader>
				<PanelHeaderTitle>{ /* Panel title */ }</PanelHeaderTitle>
			</PanelHeader>
			<PanelBody>
				{ /* Here should be all the content of the panel */ }
			</PanelBody>
		</Panel>
	);
}
```

2. Creating an instance of the panel

```ts
// panel.ts
import { createPanel } from '@elementor/editor-panels';
import MyPanel from './components/my-panel';

export const {
	panel,
	usePanelStatus,
	usePanelActions,
} = createPanel( {
	id: 'my-panel',
	component: MyPanel
} );
```

3. Registering the panel

```ts
// init.ts
import { registerPanel } from '@elementor/editor-panels';
import { panel } from './panel';

function init() {
	registerPanel( panel );
}
```

```ts
// index.ts
import init from './init';

init();
```

### Using panel actions and state

To change or read the state of a panel (open/close), you can use 2 hooks that are being returned
from the `createPanel()` function.
Let's assume that we have a button that should open the panel when clicked, and close it when clicked again.

```tsx
// components/my-panel-button.tsx
import { usePanelStatus, usePanelActions } from '../panel';

export default function MyPanelButton() {
	const { isOpen, isBlocked } = usePanelStatus();
	const { open, close } = usePanelActions();

	return (
		<button onClick={ isOpen ? close : open } disabled={ isBlocked }>
			{ isOpen ? 'Close panel' : 'Open panel' }
		</button>
	);
}
```
