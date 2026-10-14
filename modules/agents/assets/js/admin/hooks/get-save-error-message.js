import { __ } from '@wordpress/i18n';

export const getSaveErrorMessage = ( reason ) => {
	if ( reason && 'string' === typeof reason.message && reason.message ) {
		return reason.message;
	}

	if ( 'string' === typeof reason && reason ) {
		return reason;
	}

	return __( 'Something went wrong. Please try again.', 'elementor' );
};
