export class KitEnqueueFonts extends $e.modules.hookUI.After {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'kit-enqueue-fonts';
	}

	getContainerType() {
		return 'document';
	}

	getConditions() {
		return 'kit' === elementor.documents.getCurrent().config.type;
	}

	apply( args ) {
		const { containers = [ args.container ], settings } = args;

		containers.forEach( ( /* Container */ container ) => {
			Object.entries( settings ).forEach( ( [ key, value ] ) => {
				if ( 'font' === container.controls[ key ].type && value ) {
					elementor.helpers.enqueueFont( value );
				}
			} );
		} );
	}
}

export default KitEnqueueFonts;
