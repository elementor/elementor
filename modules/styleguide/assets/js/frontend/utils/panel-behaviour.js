import { commands } from './commands';

export const togglePopover = ( name, type, id ) => {
	commands( 'design-guidelines/toggle-global-picker', {
		name, type, id,
	} );
};
