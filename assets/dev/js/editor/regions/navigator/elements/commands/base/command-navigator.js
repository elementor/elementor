import CommandBase from 'elementor-api/modules/command-base';

export class CommandNavigator extends CommandBase {
	initialize() {
		if ( ! $e.components.get( 'navigator' ).isOpen ) {
            $e.run( 'navigator/open' );
		}
	}

	validateArgs( args ) {
		if ( ! $e.components.get( 'navigator' ).isOpen ) {
			throw Error( `Cannot use: '${ this.component.getNamespace() }' while navigator is closed.` );
		}

		if ( this.shouldRequireContainer() ) {
			this.requireContainer( args );

			const { containers = [ args.container ] } = args;

			containers.forEach( ( container ) => {
				if ( ! container.navigator ) {
					throw Error( `'container.navigator' is required, container id: '${ container.id }' ` );
				}
			} );
		}
	}

	shouldRequireContainer() {
		return true;
	}
}

export default CommandNavigator;
