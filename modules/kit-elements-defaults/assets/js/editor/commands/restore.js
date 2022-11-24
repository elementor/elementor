import { updateElementDefaults } from '../api';

export default class Restore extends $e.modules.CommandBase {
	async apply( { type, defaults } ) {
		$e.internal( 'panel/state-loading' );

		try {
			await updateElementDefaults( type, defaults );

			elementor.notifications.showToast( {
				message: __( 'Previous settings restored.', 'elementor' ),
			} );
		} catch ( e ) {
			elementor.notifications.showToast( {
				message: __( 'An error occurred.', 'elementor' ),
			} );

			throw e;
		} finally {
			$e.internal( 'panel/state-ready' );
		}
	}
}
