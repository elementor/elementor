import CommandBase from 'elementor-api/modules/command-base';

export class Collapse extends CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'element', args );
	}

	apply( args ) {
		const { element, callback } = args;

		// TODO: move to UI HOOK.
		element.ui.item.toggleClass( 'elementor-active', false );

		element.ui.elements.slideUp( 300, callback );
	}
}

export default Collapse;
