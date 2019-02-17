import Commands from './commands';

export default class extends Commands {
	refresh( cat ) {
		this.to( this.getCurrent( cat ), {
			refresh: true,
		} );
	}

	close( cat ) {
		delete this.current[ cat ];
	}

	beforeRun( route, args ) {
		if ( this.is( route, true ) && ! args.refresh ) {
			return false;
		}

		return super.beforeRun( route, args );
	}

	to( route, args ) {
		this.run( route, args );
	}

	// Don't clear current route.
	afterRun() {}

	error( message ) {
		throw Error( 'Route: ' + message );
	}
}
