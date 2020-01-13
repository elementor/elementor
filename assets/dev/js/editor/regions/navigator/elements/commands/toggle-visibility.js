import CommandBase from 'elementor-api/modules/command-base';

export class ToggleVisibility extends CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'element', args );
	}

	apply( args ) {
		const { element } = args;

		if ( element.model.get( 'hidden' ) ) {
			$e.run( 'navigator/elements/show', { element } );
		} else {
			$e.run( 'navigator/elements/hide', { element } );
		}
	}
}

export default ToggleVisibility;
