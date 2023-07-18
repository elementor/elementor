import { createMenu } from './menus';
import { createInjectorFor } from '@elementor/locations';
import { LOCATION_CANVAS_DISPLAY, LOCATION_PRIMARY_ACTION } from './consts';

export * from './consts';

export { createMenu } from './menus';

export const injectIntoCanvasDisplay = createInjectorFor( LOCATION_CANVAS_DISPLAY );
export const injectIntoPrimaryAction = createInjectorFor( LOCATION_PRIMARY_ACTION );

export const mainMenu = createMenu( {
	name: 'main',
	groups: [ 'exits' ],
} );

export const toolsMenu = createMenu( {
	name: 'tools',
} );

export const utilitiesMenu = createMenu( {
	name: 'utilities',
} );
