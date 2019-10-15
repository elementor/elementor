export default class Hooks extends elementorModules.Module {
	static _DEBUG = false;

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

	runDependency( command, args, then ) {
		const hooks = this.hooks.dependency[ command ];

		if ( elementor.history.history.getActive() && hooks && hooks.length ) {
			this.onRun( command, args, 'dependency' );

			this.current = command;

			for ( const i in hooks ) {
				const hook = hooks[ i ];

				if ( undefined === this.depth.dependency[ hook.id ] ) {
					this.depth.dependency[ hook.id ] = 0;
				}

				this.depth.dependency[ hook.id ]++;

				if ( 1 === this.depth.dependency[ hook.id ] ) {
					this.onCallback( command, args, 'dependency', hook.id );

					if ( ! hook.callback( args ) ) {
						throw 'Break-Hook';
					}
				}

				this.depth.dependency[ hook.id ]--;
			}
		}
	}

	runAfter( command, args, result ) {
		const hooks = this.hooks.after[ command ];

		if ( elementor.history.history.getActive() && hooks && hooks.length ) {
			this.onRun( command, args, 'after' );

			this.current = command;

			for ( const i in hooks ) {
				const hook = hooks[ i ];

				if ( undefined === this.depth.after[ hook.id ] ) {
					this.depth.after[ hook.id ] = 0;
				}

				this.depth.after[ hook.id ]++;

				if ( 1 === this.depth.after[ hook.id ] ) {
					this.onCallback( command, args, 'after', hook.id );

					hooks[ i ].callback( args, result );
				}

				this.depth.after[ hook.id ]--;
			}
		}
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

