import CommandBase from 'elementor-api/modules/command-base';

export class Show extends CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'element', args );
	}

	apply( args ) {
		const { element } = args;

		element.model.set( 'hidden', false );
	}
}

export default Show;
