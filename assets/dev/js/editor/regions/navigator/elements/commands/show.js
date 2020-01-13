import CommandBase from 'elementor-api/modules/command-base';

export class Show extends CommandBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( /* Container */ container ) => {
			container.model.set( 'hidden', false );

			container.view.toggleVisibilityClass();
		} );
	}
}

export default Show;
