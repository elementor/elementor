export default class Hooks extends elementorModules.Module {
	constructor( ...args ) {
		super( ...args );

		this.current = null;

		this.hooks = {
			dependency: {},
			after: {},
		};

		this.usedIds = [];

		this.depth = {
			dependency: {},
			after: {},
		};
	}

	getAll() {
		const result = {};

		Object.keys( this.hooks ).forEach( ( event ) => {
			if ( ! result[ event ] ) {
				result[ event ] = [];
			}

			Object.keys( this.hooks[ event ] ).forEach( ( hook ) => {
				result[ event ].push( {
					command: hook,
					callbacks: this.hooks[ event ][ hook ],
				} );
			} );
		} );

		return result;
	}

	getCurrent() {
		return this.current;
	}

	checkEvent( event ) {
		if ( -1 === Object.keys( this.hooks ).indexOf( event ) ) {
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

		if ( ! this.hooks[ event ][ command ] ) {
			this.hooks[ event ][ command ] = [];
		}

		// Save used id(s).
		this.usedIds.push( id );

		return this.hooks[ event ][ command ].push( {
			id,
			callback,
		} );
	}

	registerDependency( command, id, callback ) {
		return this.register( 'dependency', command, id, callback );
	}

	registerAfter( command, id, callback ) {
		return this.register( 'after', command, id, callback );
	}

	run( event, command, args, result ) {
		const hooks = this.hooks[ event ][ command ];

		if ( elementor.history.history.getActive() && hooks && hooks.length ) {
			this.current = command;

			this.onRun( command, args, event );

			for ( const i in hooks ) {
				const hook = hooks[ i ];

				// If not exist, set zero.
				if ( undefined === this.depth[ event ][ hook.id ] ) {
					this.depth[ event ][ hook.id ] = 0;
				}

				this.depth[ event ][ hook.id ]++;

				// Prevent recursive hooks.
				if ( 1 === this.depth[ event ][ hook.id ] ) {
					this.onCallback( command, args, event, hook.id );

					switch ( event ) {
						case 'dependency': {
							if ( ! hook.callback( args ) ) {
								this.depth[ event ][ hook.id ]--;

								throw 'Break-Hook';
							}
						}
						break;

						case 'after': {
							hooks[ i ].callback( args, result );
						}
						break;

						default:
							throw Error( `Invalid event type: '${ event }'` );
					}
				}

				this.depth[ event ][ hook.id ]--;
			}
		}
	}

	runDependency( command, args ) {
		this.run( 'dependency', command, args );
	}

	runAfter( command, args, result ) {
		this.run( 'after', command, args, result );
	}

	onRun( command, args, event ) {
		if ( ! $e.devTools ) {
			return;
		}
		$e.devTools.log.log( `%c [${ event }] HOOK: '${ command } ' ->`, 'color: yellow;font-weight: bold', args );
	}

	onCallback( command, args, event, id ) {
		if ( ! $e.devTools ) {
			return;
		}
		$e.devTools.log.log( `%c [${ event }] CALLBACK: '${ command }:${ id } ' ->`, 'color: #ff7800;font-weight: bold', args );
	}
}

