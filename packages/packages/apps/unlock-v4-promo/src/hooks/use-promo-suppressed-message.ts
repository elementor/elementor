import { useCallback } from 'react';
import { useSuppressedMessage } from '@elementor/editor-current-user';
import { notify } from '@elementor/editor-notifications';
import { __ } from '@wordpress/i18n';

const MESSAGE_KEY = 'atomic_elements_promo';

export const usePromoSuppressedMessage = () => {
	const [ suppressed, setSuppressMessage ] = useSuppressedMessage( MESSAGE_KEY );

	const toggleSuppressMessage = useCallback( () => {
		if ( ! suppressed ) {
			setSuppressMessage();
			notify( {
				type: 'default',
				message: __( 'You can re-activate Atomic elements via Editor Settings > Atomic Editor', 'elementor' ),
				id: MESSAGE_KEY,
			} );
		}
	}, [ suppressed, setSuppressMessage ] );

	return [ suppressed, toggleSuppressMessage ] as const;
};
