import Base from './events-hooks.js';

export default class Events extends Base {
	constructor( ... args ) {
		super( ... args );

		this.callbacks.before = {};

		this.depth.before = {};
	}

	getType() {
		return 'event';
	}

	registerBefore( command, id, callback ) {
		return this.register( 'before', command, id, callback );
	}

	run( event, command, args, result ) {
		const events = this.callbacks[ event ][ command ];

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

		// TODO: $e.devTools.events.run
		$e.devTools.log.eventRun( command, args, event );
	}

	onCallback( command, args, event, id ) {
		if ( ! $e.devTools ) {
			return;
		}

		// TODO:  $e.devTools.events.callback
		$e.devTools.log.eventCallback( command, args, event, id );
	}
}

