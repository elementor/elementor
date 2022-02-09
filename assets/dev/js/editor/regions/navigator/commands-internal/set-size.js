export class SetSize extends $e.modules.CommandInternalBase {
	/**
	 * Set the navigator size to a specific value or default to the storage-saved value.
	 *
	 * @override
	 * @property args.size {String|null} size A specific new size.
	 */
	apply( { size = null } ) {
		const { storage } = this.component.region;

		if ( size ) {
			storage.size.width = size;
		} else {
			storage.size.width = storage.size.width || elementorCommon.elements.$body.css( '--e-editor-navigator-width' );
		}

		// Set the navigator size using a CSS variable, and remove the inline CSS that was set by jQuery Resizeable.
		// TODO: Hook UI or Use the new uiState manager.
		elementorCommon.elements.$body.css( '--e-editor-navigator-width', storage.size.width );

		this.component.region.$el.css( 'width', '' );
	}
}

export default SetSize;
