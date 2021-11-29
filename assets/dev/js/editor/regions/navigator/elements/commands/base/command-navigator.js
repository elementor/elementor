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

			const { containers = [ args.container ] } = args;

			containers.forEach( ( container ) => {
				const navView = this.component.getElementView( container.id );

				if ( ! navView ) {
					throw Error( `$e.components.get( 'navigator/elements' ).getElementView( '${ container.id }' ); is required.` );
				}

				container.args.navigatorView = navView;
			} );
		}
	}

	shouldRequireContainer() {
		return true;
	}
}

export default CommandNavigator;
