import CommandNavigator from './base/command-navigator';

export class Collapse extends CommandNavigator {
	apply( args ) {
		const { containers = [ args.container ], callback } = args;

		containers.forEach( ( container ) => {
			const { view } = container.navigator;

			// TODO: Hook UI or Use the new uiState manager.
			view.ui.item.toggleClass( 'elementor-active', false );

			view.ui.elements.slideUp( 300, callback );
		} );
	}
}

export default Collapse;
