import CommandBase from 'elementor-api/modules/command-base';

export class ToggleFolding extends CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'element', args );
	}

	apply( args ) {
		const { element, callback } = args;

		let { state } = args;

		// If not have children or is root.
		if ( 'widget' === element.model.get( 'elType' ) || ! element.model.get( 'elType' ) ) {
			return false;
		}

		const isActive = element.ui.item.hasClass( 'elementor-active' );

		if ( isActive === state ) {
			return false;
		}

		const newArgs = { element };

		if ( callback ) {
			newArgs.callback = callback;
		}

		if ( undefined === state ) {
			// TODO: move to UI HOOK.
			element.ui.item.toggleClass( 'elementor-active', state );

			element.ui.elements.slideToggle( 300, callback );
		} else if ( state ) {
			$e.run( 'navigator/elements/expand', newArgs );
		} else {
			$e.run( 'navigator/elements/collapse', newArgs );
		}

		return true;
	}
}

export default ToggleFolding;
