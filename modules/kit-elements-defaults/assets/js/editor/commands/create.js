import { updateElementDefaults } from '../api';
import extractContainerSettings from '../extract-container-settings';

export default class Create extends $e.modules.editor.CommandContainerBase {
	validateArgs() {
		this.requireContainer();
	}

	async apply( { container } ) {
		$e.internal( 'panel/state-loading' );

		const elementType = container.model.get( 'widgetType' ) || container.model.get( 'elType' );

		const settings = extractContainerSettings( container );

		try {
			await updateElementDefaults( elementType, settings );

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
