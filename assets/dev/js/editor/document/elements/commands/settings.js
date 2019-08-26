import Base from './base';

// Settings.
export default class extends Base {
	validateArgs( args ) {
		this.requireElements( args );
		this.requireArgument( 'settings', args );
	}

	getHistory( args ) {
		// TODO: Move command to new syntax.
		return false;
	}

	apply( args ) {
		const { settings, options = {}, elements = [ args.element ] } = args;

		elements.forEach( ( element ) => {
			const settingsModel = element.getEditModel().get( 'settings' );

			if ( options.external ) {
				settingsModel.setExternalChange( settings );
			} else {
				settingsModel.set( settings );
			}
		} );
	}
}
