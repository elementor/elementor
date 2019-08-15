import Base from './base';

// Settings.
export default class extends Base {
	apply() {
		const { args } = this;

		if ( ! args.settings ) {
			throw Error( 'settings are required.' );
		}

		if ( ! args.element && ! args.elements ) {
			throw Error( 'element or elements is required.' );
		}

		if ( args.element && args.elements ) {
			throw Error( 'element and elements cannot go together please select one of them.' );
		}

		const settings = args.settings,
			options = args.options || {};

		if ( args.element ) {
			args.elements = [ args.element ];
		}

		args.elements.forEach( ( element ) => {
			const settingsModel = element.getEditModel().get( 'settings' );

			if ( options.external ) {
				settingsModel.setExternalChange( settings );
			} else {
				settingsModel.set( settings );
			}
		} );
	}
}
