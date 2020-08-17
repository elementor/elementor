import CommandNavView from './base/command-nav-view';

export class ToggleFolding extends CommandNavView {
	apply( args ) {
		const { containers = [ args.container ], callback, state } = args;

		containers.forEach( ( container ) => {
			const element = container.navView;

			// If not have children or is root.
			if ( 'widget' === element.model.get( 'elType' ) || ! element.model.get( 'elType' ) ) {
				return;
			}

			const isActive = element.ui.item.hasClass( 'elementor-active' );

			if ( isActive === state ) {
				return;
			}

			const newArgs = { container };

			if ( callback ) {
				newArgs.callback = callback;
			}

			if ( undefined === state ) {
				element.ui.item.toggleClass( 'elementor-active', state );

				element.ui.elements.slideToggle( 300, callback );
			} else if ( state ) {
				$e.run( 'navigator/elements/expand', newArgs );
			} else {
				$e.run( 'navigator/elements/collapse', newArgs );
			}
		} );
	}
}

export default ToggleFolding;
