import CommandInternalBase from 'elementor-api/modules/command-internal-base';

export class SetSize extends CommandInternalBase {
	/**
	 * Set the navigator size to a specific value or default to the storage-saved value.
	 *
	 * @override
	 * @property args.size {String|null} size A specific new size.
	 */
	apply( { size = null } ) {
		if ( size ) {
			elementor.navigator.storage.size.width = size;
		} else {
			elementor.navigator.storage.size.width = elementor.navigator.storage.size.width || elementorCommon.elements.$body.css( '--e-editor-navigator-width' );
		}

		// Set the navigator size using a CSS variable, and remove the inline CSS that was set by jQuery Resizeable.
		// TODO: Hook UI or Use the new uiState manager.
		elementorCommon.elements.$body.css( '--e-editor-navigator-width', elementor.navigator.storage.size.width );

		elementor.navigator.$el.css( 'width', '' );
	}
}

export default SetSize;
