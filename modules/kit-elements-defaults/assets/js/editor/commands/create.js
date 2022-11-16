import { updateElementDefaults } from '../api';
import extractContainerSettings from '../extract-container-settings';
import { extractElementType } from '../utils';

export default class Create extends $e.modules.editor.CommandContainerBase {
	validateArgs() {
		this.requireContainer();
	}

	async apply( { container } ) {
		$e.internal( 'panel/state-loading' );

		const settings = extractContainerSettings( container );

		try {
			await updateElementDefaults(
				extractElementType( container.model ),
				settings,
			);

			elementor.notifications.showToast( {
				message: __( 'Default settings changed.', 'elementor' ),
			} );
		} catch ( error ) {
			elementor.notifications.showToast( {
				message: __( 'An error occurred.', 'elementor' ),
			} );

			throw error;
		} finally {
			$e.internal( 'panel/state-ready' );
		}
	}
}
