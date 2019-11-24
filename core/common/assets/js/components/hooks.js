import Base from './events-hooks.js';

export default class Events extends Base {
	constructor( ... args ) {
		super( ... args );

		this.callbacks.dependency = {};

		this.depth.dependency = {};
	}

	getType() {
		return 'hook';
	}

	registerDependency( command, id, callback ) {
		return this.register( 'dependency', command, id, callback );
	}

	run( event, command, args, result ) {
		const hooks = this.callbacks[ event ][ command ];

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

								throw new elementorModules.common.HookBreak;
							}
						}
						break;

						case 'after': {
							hook.callback( args, result );
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

		// TODO: $e.devTools.hooks.run
		$e.devTools.log.hookRun( command, args, event );
	}

	onCallback( command, args, event, id ) {
		if ( ! $e.devTools ) {
			return;
		}

		// TODO: $e.devTools.hooks.callback
		$e.devTools.log.hookCallback( command, args, event, id );
	}
}

