import CommandBase from 'elementor-api/modules/command-base';

export class Show extends CommandBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			container.navView.model.set( 'hidden', false );
		} );
	}
}

export default Show;
