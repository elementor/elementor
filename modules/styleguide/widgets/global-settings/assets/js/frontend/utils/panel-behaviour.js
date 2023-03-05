import sendCommand from '../../../../../assets/js/common/utils/send-command';

export const togglePopover = ( name, type, id ) => {
	sendCommand( 'design-guidelines/toggle-global-picker', {
		name, type, id,
	} );
};
