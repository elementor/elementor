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

			// Re-initialize the toast because of a bug in the notificaitons module
			// that causes the toast to be rendered without buttons.
			// TODO: Find a better solution. Maybe fix the root cause.
			elementor.notifications.initToast();

			elementor.notifications.showToast( {
				message: __( 'Default settings changed.', 'elementor' ),
				buttons: [ {
					name: 'undo',
					text: __( 'Undo', 'elementor' ),
					callback() {
						$e.run( 'kit-elements-defaults/restore', {
							type,
							defaults: previousDefaults,
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
