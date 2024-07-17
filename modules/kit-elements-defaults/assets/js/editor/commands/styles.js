import {getElementDefaults, updateElementStyles} from '../api';
import { extractElementType } from '../utils';
import extractContainerStyles from '../extract-container-styles';

export default class Styles extends $e.modules.editor.CommandContainerBase {
	validateArgs() {
		this.requireContainer();
	}

	async apply( { container } ) {
		const type = extractElementType( container.model ),
			previousDefaults = getElementDefaults( type ),
			newDefaults = extractContainerStyles( container );

		try {
			await updateElementStyles( type, newDefaults );

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
