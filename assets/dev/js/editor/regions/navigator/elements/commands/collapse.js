import CommandNavView from './base/command-nav-view';

export class Collapse extends CommandNavView {
	apply( args ) {
		const { containers = [ args.container ], callback } = args;

		containers.forEach( ( container ) => {
			const element = container.navView;

			// TODO: move to UI HOOK.
			element.ui.item.toggleClass( 'elementor-active', false );

			element.ui.elements.slideUp( 300, callback );
		} );
	}
}

export default Collapse;
