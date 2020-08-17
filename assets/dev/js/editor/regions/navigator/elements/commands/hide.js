import CommandNavView from './base/command-nav-view';

export class Hide extends CommandNavView {
	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			container.navView.model.set( 'hidden', true );
		} );
	}
}

export default Hide;
