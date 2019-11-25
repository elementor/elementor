/**
 * TODO: onRun, onCallback should be at base.
 * TODO: rename to callbacks.js
 */
export default class EventsHooks extends elementorModules.Module {
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
		if ( 0 === this.usedIds.indexOf( id ) ) {
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

	registerAfter( command, id, callback ) {
		// After is common callback.
		return this.register( 'after', command, id, callback );
	}
}
