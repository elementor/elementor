import CommandBase from 'elementor-api/modules/command-base';

export class Hide extends CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'element', args );
	}

	apply( args ) {
		const { element } = args;

		element.model.set( 'hidden', true );
	}
}

export default Hide;
