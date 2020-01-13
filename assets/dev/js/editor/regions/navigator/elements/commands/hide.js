import CommandBase from 'elementor-api/modules/command-base';

export class Hide extends CommandBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( /* Container */ container ) => {
			container.model.set( 'hidden', true );

			container.view.toggleVisibilityClass();
		} );
	}
}

export default Hide;
