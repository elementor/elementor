/**
 * TODO: Should we merge it with hooks?
 */
export default class Events extends elementorModules.Module {
	constructor( ...args ) {
		super( ...args );

		this.current = null;

		this.events = {
			before: {},
			after: {},
		};

		this.usedIds = [];

		this.depth = {
			before: {},
			after: {},
		};
	}

	getAll() {
		const result = {};

		Object.keys( this.events ).forEach( ( event ) => {
			if ( ! result[ event ] ) {
				result[ event ] = [];
			}

			Object.keys( this.events[ event ] ).forEach( ( hook ) => {
				result[ event ].push( {
					command: hook,
					callbacks: this.events[ event ][ hook ],
				} );
			} );
		} );

		return result;
	}

	getCurrent() {
		return this.current;
	}

	checkEvent( event ) {
		if ( -1 === Object.keys( this.events ).indexOf( event ) ) {
			throw Error( `event: '${ event }' is not available.` );
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

		if ( ! this.events[ event ][ command ] ) {
			this.events[ event ][ command ] = [];
		}

		// Save used id(s).
		this.usedIds.push( id );

		return this.events[ event ][ command ].push( {
			id,
			callback,
		} );
	}

	registerBefore( command, id, callback ) {
		return this.register( 'before', command, id, callback );
	}

	registerAfter( command, id, callback ) {
		return this.register( 'after', command, id, callback );
	}

	run( event, command, args, result ) {
		const events = this.events[ event ][ command ];

		if ( events && events.length ) {
			this.current = command;

			this.onRun( command, args, event );

			for ( const i in events ) {
				const eventObject = events[ i ];

				// If not exist, set zero.
				if ( undefined === this.depth[ event ][ eventObject.id ] ) {
					this.depth[ event ][ eventObject.id ] = 0;
				}

				this.depth[ event ][ eventObject.id ]++;

				// Prevent recursive events.
				if ( 1 === this.depth[ event ][ eventObject.id ] ) {
					this.onCallback( command, args, event, eventObject.id );

					switch ( event ) {
						case 'before':
							eventObject.callback( args );
							break;

						case 'after':
							eventObject.callback( args, result );
							break;

						default:
							throw Error( `Invalid event type: '${ event }'` );
					}
				}

				this.depth[ event ][ eventObject.id ]--;
			}
		}
	}

	runBefore( command, args ) {
		this.run( 'before', command, args );
	}

	runAfter( command, args, result ) {
		this.run( 'after', command, args, result );
	}

	onRun( command, args, event ) {
		if ( ! $e.devTools ) {
			return;
		}
		$e.devTools.log.log( `%c [${ event }] EVENT: '${ command } ' ->`, 'color: #ffffe0;font-weight: bold', args );
	}

	onCallback( command, args, event, id ) {
		if ( ! $e.devTools ) {
			return;
		}
		$e.devTools.log.log( `%c [${ event }] EVENT CALLBACK: '${ command }:${ id } ' ->`, 'color: #00ff80;font-weight: bold', args );
	}
}

