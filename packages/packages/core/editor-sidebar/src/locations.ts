import { createLocation } from '@elementor/locations';
import { createMenu } from '@elementor/menus';

import Action from './components/actions/action';
import Custom from './components/actions/custom';

export const { inject: injectIntoSidebarTools, Slot: SidebarToolsSlot } = createLocation();

export const { inject: injectIntoSidebarFooter, Slot: SidebarFooterSlot } = createLocation();

const components = {
	Action,
	ToggleAction: Action,
	Custom,
};

export const sidebarTools = createMenu( { components, groups: [ 'elements', 'design' ] } );

export const sidebarFooter = createMenu( { components, groups: [ 'document' ] } );
