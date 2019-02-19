import Commands from './commands';

export default class extends Commands {
	reload( route, args ) {
		const parts = route.split( '/' ),
			component = parts[ 0 ];

		this.close( component );

		this.to( route, args );
	}

	refreshComponent( component ) {
		const currentRoute = this.getCurrent( component ),
			currentArgs = this.getCurrentArgs( component );

		this.close( component );

		this.to( currentRoute, currentArgs );
	}

	close( component ) {
		delete this.current[ component ];
		delete this.currentArgs[ component ];
	}

	beforeRun( route, args ) {
		if ( this.is( route, args ) ) {
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

	is( route, args = {} ) {
		if ( ! super.is( route ) ) {
			return false;
		}

		const parts = route.split( '/' ),
			component = parts[ 0 ];

		return _.isEqual( args, this.currentArgs[ component ] );
	}

	isPartOf( route ) {
		if ( ! super.is( route ) ) {
			return false;
		}

		/**
		 * Check against current command hierarchically.
		 * For example `is( 'panel' )` will be true for `panel/elements`
		 * `is( 'panel/editor' )` will be true for `panel/editor/style`
		 */
		const parts = route.split( '/' ),
			component = parts[ 0 ],
			toCheck = [],
			currentParts = this.current[ component ].split( '/' );

		let match = false;

		currentParts.forEach( ( part ) => {
			toCheck.push( part );
			if ( toCheck.join( '/' ) === route ) {
				match = true;
			}
		} );

		return match;
	}
}
