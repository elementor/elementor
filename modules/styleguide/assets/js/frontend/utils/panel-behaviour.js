import { sendCommand } from './send-command';

export const togglePopover = ( type, name, id, controlName ) => {
	sendCommand( 'controls/toggle-control', {
		controlPath: `${ type }_${ name }/${ id}/${ controlName }`
	} );
};
