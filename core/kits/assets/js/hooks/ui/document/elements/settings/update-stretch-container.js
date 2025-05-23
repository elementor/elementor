/**
 * On change kit stretch container settings - update the preview stretched sections.
 */
export class KitUpdateStretchContainer extends $e.modules.hookUI.After {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'kit-update-stretch-container';
	}

	getContainerType() {
		return 'document';
	}

	getConditions() {
		return 'kit' === elementor.documents.getCurrent().config.type;
	}

	apply( args ) {
		const { settings } = args;

		Object.entries( settings ).forEach( ( [ key, value ] ) => {
			if ( 'stretched_section_container' === key ) {
				elementorFrontend.config.kit[ key ] = value;
				elementor.channels.editor.trigger( 'kit:change:stretchContainer' );
			}
		} );
	}
}

export default KitUpdateStretchContainer;
