import { sendCommand } from './send-command';

export const togglePopover = ( name, type, id ) => {
	sendCommand( 'design-guidelines/toggle-global-picker', {
		name, type, id,
	} );
};
