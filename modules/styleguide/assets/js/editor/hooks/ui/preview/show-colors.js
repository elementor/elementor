export class StyleguideShowColors extends $e.modules.hookUI.After {
	getCommand() {
		return 'panel/global/global-colors';
	}

	getId() {
		return 'styleguide/preview/show/colors';
	}

	apply( args ) {
		console.log( 'Colors shown' );
	}
}

export default StyleguideShowColors;
