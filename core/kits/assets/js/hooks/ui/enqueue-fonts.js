export class EnqueueFonts extends $e.modules.hookUI.After {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'kit-enqueue-fonts';
	}

	getContainerType() {
		return 'document';
	}

	apply( args ) {
		Object.entries( args.settings ).forEach( ( [ key, value ] ) => {
			if ( 'font' === args.container.controls[ key ].type && value ) {
				elementor.helpers.enqueueFont( value );
			}
		} );
	}
}

export default EnqueueFonts;
