export default class Callbacks extends elementorModules.Module {
	constructor( ...args ) {
		super( ...args );

		this.current = null;

		this.usedIds = [];

		this.callbacks = { after: {} };

		this.depth = { after: {} };
	}

	getType() {
		elementorModules.forceMethodImplementation();
	}

	getAll() {
		const result = {};

		Object.keys( this.callbacks ).forEach( ( event ) => {
			if ( ! result[ event ] ) {
				result[ event ] = [];
			}

			Object.keys( this.callbacks[ event ] ).forEach( ( hook ) => {
				result[ event ].push( {
					command: hook,
					callbacks: this.callbacks[ event ][ hook ],
				} );
			} );
		} );

		return result;
	}

	getCurrent() {
		return this.current;
	}

	getUsedIds() {
		return this.usedIds;
	}

	getCallback( event, command ) {
		for ( const _command in this.callbacks[ event ] ) {
			// In case of multi command hooking.
			if ( _command.includes( ',' ) ) {
				if ( _command.split( ',' ).some( ( _multiCommand ) => _multiCommand === command ) ) {
					return this.callbacks[ event ][ _command ];
				}
			}
		}

		return this.callbacks[ event ][ command ];
	}

	checkEvent( event ) {
		if ( -1 === Object.keys( this.callbacks ).indexOf( event ) ) {
			throw Error( `${ this.getType() }: '${ event }' is not available.` );
		}
	}

	checkId( id ) {
		if ( this.usedIds.indexOf( id ) > 0 ) {
			throw Error( `id: '${ id }' is already in use.` );
		}
	}

	register( event, command, id, callback ) {
		this.checkEvent( event );
		this.checkId( id );

		if ( ! this.callbacks[ event ][ command ] ) {
			this.callbacks[ event ][ command ] = [];
		}

		// Save used id(s).
		this.usedIds.push( id );

		return this.callbacks[ event ][ command ].push( {
			id,
			callback,
		} );
	}

	run( event, command, args, result ) {
		const callbacks = this.getCallback( event, command );

		if ( this.isShouldRun( callbacks ) ) {
			this.current = command;

			this.onRun( command, args, event );

			this.runCallbacks( event, command, callbacks, args, result );
		}
	}

	runCallbacks( event, command, callbacks, args, result ) {
		for ( const i in callbacks ) {
			const callback = callbacks[ i ];

			// If not exist, set zero.
			if ( undefined === this.depth[ event ][ callback.id ] ) {
				this.depth[ event ][ callback.id ] = 0;
			}

			this.depth[ event ][ callback.id ]++;

			// Prevent recursive hooks.
			if ( 1 === this.depth[ event ][ callback.id ] ) {
				this.onCallback( command, args, event, callback.id );

				if ( ! this.runCallback( event, callback, args, result ) ) {
					throw Error( `Callback failed, event: '${ event }'` );
				}
			}

			this.depth[ event ][ callback.id ]--;
		}
	}

	runCallback( event, callback, args, result ) {
		elementorModules.forceMethodImplementation();
	}

	isShouldRun( callbacks ) {
		elementorModules.forceMethodImplementation();
	}

	onRun( command, args, event ) {
		elementorModules.forceMethodImplementation();
	}

	onCallback( command, args, event, id ) {
		elementorModules.forceMethodImplementation();
	}
}
