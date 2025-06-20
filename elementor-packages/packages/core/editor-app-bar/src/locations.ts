import { createLocation } from '@elementor/locations';
import { createMenu } from '@elementor/menus';

import Action from './components/actions/action';
import Link from './components/actions/link';
import ToggleAction from './components/actions/toggle-action';

export const { inject: injectIntoPageIndication, Slot: PageIndicationSlot } = createLocation();

export const { inject: injectIntoResponsive, Slot: ResponsiveSlot } = createLocation();

export const { inject: injectIntoPrimaryAction, Slot: PrimaryActionSlot } = createLocation();

const components = {
	Action,
	ToggleAction,
	Link,
};

export const mainMenu = createMenu( {
	groups: [ 'exits' ],
	components,
} );

export const toolsMenu = createMenu( { components } );

export const utilitiesMenu = createMenu( { components } );

export const integrationsMenu = createMenu( { components } );
