import CommandBase from 'elementor-api/modules/command-base';

export class Expand extends CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'element', args );
	}

	apply( args ) {
		const { element, callback } = args;

		// TODO: move to UI HOOK.
		element.ui.item.toggleClass( 'elementor-active', true );

		element.ui.elements.slideDown( 300, callback );
	}
}

export default Expand;
