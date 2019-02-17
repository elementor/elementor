export default class extends elementorModules.editor.utils.Module {
	constructor( ...args ) {
		super( ...args );

		this.current = {};
		this.commands = {};
		this.dependencies = {};
		this.shortcuts = {};
	}

	registerDependency( cat, callback ) {
		this.dependencies[ cat ] = callback;
	}

	register( command, callback, shortcut ) {
		if ( this.commands[ command ] ) {
			this.error( '`' + command + '` is already registered.' );
		}

		this.commands[ command ] = callback;

		if ( this.shortcut ) {
			if ( this.shortcuts[ shortcut ] ) {
				this.error( 'Shortcut `' + shortcut + '` is already taken by `' + command + '`' );
			}

			this.shortcuts[ shortcut ] = command;
		}
	}

	unregister( command ) {
		delete this.commands[ command ];
	}

	is( command, strict = false ) {
		const parts = command.split( '/' ),
			cat = parts[ 0 ];

		if ( ! this.current[ cat ] ) {
			return false;
		}

		if ( strict ) {
			return command === this.current[ cat ];
		}

		/**
		 * Check against current command hierarchically.
		 * For example `is( 'panel' )` will be true for `panel/elements`
		 * `is( 'panel/editor' )` will be true for `panel/editor/style`
		 */
		const toCheck = [],
			currentParts = this.current[ cat ].split( '/' );

		let match = false;

		currentParts.forEach( ( part ) => {
			toCheck.push( part );
			if ( toCheck.join( '/' ) === command ) {
				match = true;
			}
		} );

		return match;
	}

	getCurrent( cat ) {
		if ( ! this.current[ cat ] ) {
			return false;
		}

		return this.current[ cat ];
	}

	beforeRun( command, args ) {
		if ( ! this.commands[ command ] ) {
			this.error( '`' + command + '` not found.' );
		}

		const parts = command.split( '/' ),
			cat = parts[ 0 ];

		if ( this.dependencies[ cat ] && ! this.dependencies[ cat ].apply( null, [ args ] ) ) {
			return false;
		}

		this.current[ cat ] = command;

		return true;
	}

	run( command, args ) {
		args = args || {};

		if ( ! this.beforeRun( command, args ) ) {
			return;
		}

		if ( args.onBefore ) {
			args.onBefore.apply( this, [ args ] );
		}

		this.commands[ command ].apply( this, [ args ] );

		if ( args.onAfter ) {
			args.onAfter.apply( this, [ args ] );
		}

		this.afterRun( command, args );
	}

	afterRun( command, args ) {
		const parts = command.split( '/' ),
			cat = parts[ 0 ];

		delete this.current[ cat ];
	}

	error( message ) {
		throw Error( 'Commands: ' + message );
	}
}
