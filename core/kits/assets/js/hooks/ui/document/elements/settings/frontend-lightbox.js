export class KitFrontendLightbox extends $e.modules.hookUI.After {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'kit-frontend-lightbox';
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
			if ( -1 !== key.indexOf( 'lightbox' ) ) {
				elementorFrontend.config.kit[ key ] = value;
			}
		} );
	}
}

export default KitFrontendLightbox;
