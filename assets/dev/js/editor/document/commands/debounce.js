import Base from './base';

const DEFAULT_DEBOUNCE_DELAY = 800;

export default class Debounce extends Base {
	/**
	 * Debounce delay.
	 *
	 * @type {number}
	 */
	static debounceDelay = DEFAULT_DEBOUNCE_DELAY;

	/**
	 * Last `HistoryId` since last debounce.
	 *
	 * @type {number}
	 */
	static debounceHistoryId = 0;

	/**
	 * Debounce timer.
	 *
	 * @type Number
	 */
	static debounceTimer = 0;

	/**
	 * Debounce action, how should the debounce extender act.
	 *
	 * @type {string}
	 */
	static debounceAction = '';

	/**
	 * Array of Object(s) { id = 'id of args snapshot', handler = ' return value of setTimeout ' }.
	 *
	 * @type {Array}
	 */
	static uniqueArgsStates = [];

	/**
	 * Each stimulation we save the unique `this.args` sate id.
	 *
	 * @type {String}
	 */
	static lastUniqueArgsId = '';

	/**
	 * Function logHistory().
	 *
	 * Do the actual history logging.
	 *
	 * @param {Number|Boolean} historyId
	 * @param {{}} args
	 */
	static logHistory( args, historyId = false ) {
		throw Error( 'static logHistory() should be implemented, please provide static logHistory functionality.' );
	}

	constructor( args ) {
		super( args );

		if ( this.getDebounceDelay ) {
			this.constructor.debounceDelay = this.getDebounceDelay();
		}
	}

	getArgsUniqueId( args = this.args ) {
		const { containers = [ args.container ], settings = {} } = args;

		return containers.map(
			( container ) => container.id
		).join( ',' ) + ',' + Object.keys( settings );
	}

	getHistory( args ) {
		if ( ! this.isHistoryActive() ) {
			return false;
		}

		// Clear the action first.
		this.constructor.debounceAction = '';

		const { options = {} } = args,
			currentArgsUniqueId = this.getArgsUniqueId( args );

		if ( options.debounceHistory ) {
			// Get current time.
			const now = ( new Date() ).getTime();

			// If no timer or 1 second passed from last simulation.
			if ( ! this.constructor.debounceTimer || now - this.constructor.debounceTimer > this.constructor.debounceDelay ) {
				this.constructor.debounceAction = 'debounce';
			}

			// Clear all current snapshots
			this.constructor.uniqueArgsStates = this.constructor.uniqueArgsStates.filter( ( uniqueArgsState ) => {
				if ( uniqueArgsState.id === currentArgsUniqueId ) {
					clearTimeout( uniqueArgsState.handler );
					return false;
				}

				return true;
			} );

			// Anyway if `options.debounceHistory` set to be true, we create timeout for saving log history.
			this.constructor.uniqueArgsStates.push( {
				id: currentArgsUniqueId,
				handler: setTimeout( () => {
					this.constructor.logHistory( args, this.constructor.debounceHistoryId );
				}, this.constructor.debounceDelay ),
			} );

			// Init || Update timer.
			this.constructor.debounceTimer = now;
		} else {
			this.constructor.debounceAction = 'normal';
		}

		this.constructor.lastUniqueArgsId = currentArgsUniqueId;

		return this.constructor.debounceAction;
	}

	onAfterApply( args ) {
		if ( this.isHistoryActive() ) {
			if ( 'normal' === this.constructor.debounceAction ) {
				this.constructor.logHistory( args );
			} else if ( 'debounce' === this.constructor.debounceAction && this.historyId ) {
				this.constructor.debounceHistoryId = this.historyId;
			}
		}
	}
}
