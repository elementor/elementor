export default class extends elementorModules.editor.utils.Module {
	constructor( ...args ) {
		super( ...args );

		this.current = {};
		this.routes = {};
		this.dependencies = {};
		this.shortcuts = {};
	}

	register( path, callback, shortcut ) {
		if ( this.routes[ path ] ) {
			throw Error( 'Routes `' + path + '` is already registered.' );
		}

		this.routes[ path ] = callback;

		if ( this.shortcut ) {
			if ( this.shortcuts[ shortcut ] ) {
				throw Error( 'Shortcut `' + shortcut + '` is already taken by `' + path + '`' );
			}

			this.shortcuts[ shortcut ] = path;
		}
	}

	registerDependency( cat, callback ) {
		this.dependencies[ cat ] = callback;
	}

	unregister( path ) {
		delete this.routes[ path ];
	}

	is( route ) {
		const parts = route.split( '/' ),
			cat = parts[ 0 ];
		if ( ! this.current[ cat ] ) {
			throw Error( '`' + cat + '` is not a registered component.' );
		}

		/**
		 * Check against current route hierarchically.
		 * For example `is( 'panel' )` will be true for `panel/elements`
		 * `is( 'panel/editor' )` will be true for `panel/editor/style`
		 */
		const toCheck = [],
			currentParts = this.current[ cat ].split( '/' );

		let match = false;

		currentParts.forEach( ( part ) => {
			toCheck.push( part );
			if ( toCheck.join( '/' ) === route ) {
				match = true;
			}
		} );

		return match;
	}

	refresh( cat ) {
		this.to( this.getCurrent( cat ), {
			refresh: true,
		} );
	}

	getCurrent( cat ) {
		if ( ! this.current[ cat ] ) {
			return false;
		}

		return this.current[ cat ];
	}

	to( route, args ) {
		const parts = route.split( '/' ),
			cat = parts[ 0 ];

		args = args || {};

		if ( route === this.current[ cat ] && ! args.refresh ) {
			return;
		}

		if ( ! this.routes[ route ] ) {
			throw Error( 'Route `' + route + '` not found.' );
		}

		if ( this.dependencies[ cat ] && ! this.dependencies[ cat ].apply( null, [ args ] ) ) {
			return;
		}

		this.current[ cat ] = route;

		if ( ! args ) {
			args = {};
		}

		this.routes[ route ].apply( this, [ args ] );
	}
}
