import CommandNavView from './base/command-nav-view';

export class ToggleVisibility extends CommandNavView {
	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			if ( container.navView.model.get( 'hidden' ) ) {
				$e.run( 'navigator/elements/show', { container } );
			} else {
				$e.run( 'navigator/elements/hide', { container } );
			}
		} );
	}
}

export default ToggleVisibility;
