import CommandBase from 'elementor-api/modules/command-base';

export class CommandNavigator extends CommandBase {
	validateArgs( args ) {
		this.requireContainer( args );

		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			if ( ! container.navigator ) {
				throw Error( `'container.navigator' is required, container id: '${ container.id }' ` );
			}
		} );
	}
}

export default CommandNavigator;
