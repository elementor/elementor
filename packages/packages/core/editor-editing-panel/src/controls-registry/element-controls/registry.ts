import { type ControlComponent } from '@elementor/editor-controls';

import { type ControlRegistry, controlsRegistry } from '../controls-registry';
import { ListItemsControl } from './list-items-control/list-items-control';
import { TabsControl } from './tabs-control/tabs-control';

const controlTypes = {
	'list-items': { component: ListItemsControl as ControlComponent, layout: 'full' },
	tabs: { component: TabsControl as ControlComponent, layout: 'full' },
} as const satisfies ControlRegistry;

export const registerElementControls = () => {
	Object.entries< ( typeof controlTypes )[ keyof typeof controlTypes ] >( controlTypes ).forEach(
		( [ type, { component, layout } ] ) => {
			controlsRegistry.register( type, component, layout );
		}
	);
};
