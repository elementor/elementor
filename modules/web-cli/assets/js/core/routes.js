import Commands from './commands';

export default class Routes extends Commands {
	constructor( ...args ) {
		super( ...args );

		this.savedStates = {};
		this.historyPerComponent = {};
	}

	refreshContainer( container ) {
		const currentRoute = this.getCurrent( container ),
			currentArgs = this.getCurrentArgs( container );

		this.clearCurrent( container );

		this.to( currentRoute, currentArgs );
	}

	getHistory( namespaceRoot = '' ) {
		if ( namespaceRoot ) {
			return this.historyPerComponent[ namespaceRoot ] || [];
		}

		return this.historyPerComponent;
	}

	clearHistory( namespaceRoot ) {
		delete this.historyPerComponent[ namespaceRoot ];
	}

	clearCurrent( container ) {
		const route = this.current[ container ];

		if ( ! route ) {
			return;
		}

		this.detachCurrent( container );

		this.getComponent( route ).onCloseRoute( route );

		this.dispatchOnClose( route );
	}

	clear() {
		Object.keys( this.current ).forEach( ( container ) => this.clearCurrent( container ) );
	}

	saveState( container ) {
		this.savedStates[ container ] = {
			route: this.current[ container ],
			args: this.currentArgs[ container ],
		};

		return this;
	}

	restoreState( container ) {
		if ( ! this.savedStates[ container ] ) {
			return false;
		}

		this.to( this.savedStates[ container ].route, this.savedStates[ container ].args );

		return true;
	}

	validateRun( route, args = {} ) {
		if ( ! super.validateRun( route, args ) ) {
			return false;
		}

		if ( this.is( route, args ) && ! args.refresh ) {
			return false;
		}

		const component = this.getComponent( route );

		if ( ! component.isOpen || args.reOpen ) {
			component.isOpen = component.open( args );
		}

		return component.isOpen;
	}

	/**
	 * @override
	 */
	beforeRun( route, args ) {
		const component = this.getComponent( route ),
			container = component.getServiceName(),
			oldRoute = this.current[ container ];

		if ( oldRoute ) {
			this.getComponent( oldRoute ).onCloseRoute( oldRoute );
		}

		Commands.trace.push( route );

		super.beforeRun( route, args, false );

		this.attachCurrent( container, route, args );

		// In the previous condition, `$e.routes.is()` resolves the old route as active (because the actual route
		// switching happens inside `this.attachCurrent()`), so we can't use it there.
		if ( oldRoute ) {
			this.dispatchOnClose( oldRoute );
		}
	}

	to( route, args ) {
		this.run( route, args );

		const namespaceRoot = this.getComponent( route ).getServiceName();

		if ( ! this.historyPerComponent[ namespaceRoot ] ) {
			this.historyPerComponent[ namespaceRoot ] = [];
		}

		this.historyPerComponent[ namespaceRoot ].push( {
			route,
			args,
		} );
	}

	back( namespaceRoot ) {
		const history = this.getHistory( namespaceRoot );

		// Remove current;
		history.pop();

		const last = history.pop();

		if ( ! last ) {
			return;
		}

		this.to( last.route, last.args );
	}

	// Don't use the event object.
	runShortcut( command ) {
		this.to( command );
	}

	// Don't clear current route.
	afterRun( route, args, results = undefined ) {
		const component = this.getComponent( route );

		component.onRoute( route, args );

		this.dispatchOnOpen( route );

		super.afterRun( route, args, results, false );

		Commands.trace.pop();
	}

	is( route, args = {} ) {
		if ( ! super.is( route ) ) {
			return false;
		}

		const container = this.getComponent( route ).getServiceName();

		return _.isEqual( args, this.currentArgs[ container ] );
	}

	isPartOf( route ) {
		/**
		 * Check against current command hierarchically.
		 * For example `is( 'panel' )` will be true for `panel/elements`
		 * `is( 'panel/editor' )` will be true for `panel/editor/style`
		 */
		const parts = route.split( '/' ),
			container = parts[ 0 ],
			toCheck = [],
			currentParts = this.current[ container ] ? this.current[ container ].split( '/' ) : [];

		let match = false;

		currentParts.forEach( ( part ) => {
			toCheck.push( part );
			if ( toCheck.join( '/' ) === route ) {
				match = true;
			}
		} );

		return match;
	}

	error( message ) {
		throw Error( 'Routes: ' + message );
	}

	dispatchOnOpen( route ) {
		window.dispatchEvent( new CustomEvent( 'elementor/routes/open', {
			detail: {
				route,
			},
		} ) );
	}

	dispatchOnClose( route ) {
		window.dispatchEvent( new CustomEvent( 'elementor/routes/close', {
			detail: {
				route,
			},
		} ) );
	}
}
