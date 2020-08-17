import CommandBase from 'elementor-api/modules/command-base';

export class CommandNavView extends CommandBase {
	validateArgs( args ) {
		this.requireContainer( args );

		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			if ( ! container.navView ) {
				debugger;
				throw Error( `'container.navView' is required, container id: '${ container.id }' ` );
			}
		} );
	}
}

export default CommandNavView;
