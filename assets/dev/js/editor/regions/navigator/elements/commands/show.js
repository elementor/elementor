import CommandNavView from './base/command-nav-view';

export class Show extends CommandNavView {
	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			container.navView.model.set( 'hidden', false );
		} );
	}
}

export default Show;
