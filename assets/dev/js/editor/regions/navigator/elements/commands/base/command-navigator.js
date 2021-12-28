import CommandBase from 'elementor-api/modules/command-base';

export class CommandNavigator extends CommandBase {
	initialize() {
		if ( ! elementor.navigator.isOpen ) {
			$e.run( 'navigator/open' );
		}
	}

	validateArgs( args ) {
		if ( ! elementor.navigator.isOpen ) {
			throw Error( `Cannot use: '${ this.component.getNamespace() }' while navigator is closed.` );
		}

		// Not all navigator commands require container to work, eg: 'navigator/elements/toggle-folding-all'.
		if ( this.shouldRequireContainer() ) {
			this.requireContainer( args );
		}
	}

	shouldRequireContainer() {
		return true;
	}
}

export default CommandNavigator;
