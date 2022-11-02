import { deleteElementDefaults } from '../api';

export default class Delete extends $e.modules.CommandBase {
	async apply( { type } ) {
		$e.internal( 'panel/state-loading' );

		try {
			await deleteElementDefaults( type );

			elementor.notifications.showToast( {
				message: __( 'Default settings has been reset.', 'elementor' ),
			} );
		} catch ( e ) {
			elementor.notifications.showToast( {
				message: __( 'An error occurred.', 'elementor' ),
			} );

			throw error;
		} finally {
			$e.internal( 'panel/state-ready' );
		}
	}
}
