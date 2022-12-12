import { getElementDefaults, updateElementDefaults } from '../api';
import extractContainerSettings from '../extract-container-settings';
import { extractElementType } from '../utils';

export default class Create extends $e.modules.editor.CommandContainerBase {
	validateArgs() {
		this.requireContainer();
	}

	async apply( { container } ) {
		$e.internal( 'panel/state-loading' );

		const type = extractElementType( container.model ),
			previousDefaults = getElementDefaults( type ),
			newDefaults = extractContainerSettings( container );

		try {
			await updateElementDefaults( type, newDefaults );

			elementor.notifications.showToast( {
				message: __( 'Default settings changed.', 'elementor' ),
				buttons: [ {
					name: 'undo',
					text: __( 'Undo', 'elementor' ),
					callback() {
						$e.run( 'kit-elements-defaults/restore', {
							type,
							settings: previousDefaults,
						} );
					},
				} ],
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
