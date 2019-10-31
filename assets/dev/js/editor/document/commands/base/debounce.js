import History from './history';

/**
 * @typedef UniqueArgsState
 * @type {object}
 * @property {string} id
 * @property {number} handler
 */

/**
 * @type {number}
 */
export const DEFAULT_DEBOUNCE_DELAY = 800;

export default class Debounce extends History {
	/**
	 * Last `HistoryId` since last debounce.
	 *
	 * @type {number}
	 */
	static lastHistoryId = 0;

	/**
	 * Debounce timer.
	 *
	 * @type {number}
	 */
	static timer = 0;

	/**
	 * Debounce action, how should the debounce extender act.
	 *
	 * @type {string}
	 */
	static action = '';

	/**
	 * Array of UniqueArgsState
	 *
	 * @type {Array.<UniqueArgsState>}
	 */
	static uniqueArgsStates = [];

	/**
	 * Each stimulation we save the unique `this.args` sate id.
	 *
	 * @type {string}
	 */
	static lastUniqueArgsId = '';

	/**
	 * Function logHistory().
	 *
	 * Do the actual history logging.
	 *
	 * @param {{}} args
	 * @param {number|boolean} historyId
	 */
	static logHistory( args, historyId = false ) {
		throw Error( 'static logHistory() should be implemented, please provide static logHistory functionality.' );
	}

	/**
	 * Function runHookAfter().
	 *
	 * Run the hook after.
	 */
	runHookAfter() {
		$e.hooks.runAfter( this.currentCommand, this.args );
	}

	/**
	 * Function getArgsUniqueId().
	 *
	 * Get "snapshot" of args and return unique id.
	 *
	 * @param {{}} args
	 *
	 * @returns {string}
	 */
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
		Debounce.action = '';

		const { options = {} } = args,
			currentArgsUniqueId = this.getArgsUniqueId( args );

		if ( options.debounceHistory ) {
			// Get current time.
			const now = ( new Date() ).getTime();

			// If no timer or `DEFAULT_DEBOUNCE_DELAY` passed from last stimulation.
			if ( ! Debounce.timer || now - Debounce.timer > DEFAULT_DEBOUNCE_DELAY ) {
				Debounce.action = 'debounce';
			}

			// Clear all current snapshots.
			Debounce.uniqueArgsStates = Debounce.uniqueArgsStates.filter( ( uniqueArgsState ) => {
				if ( uniqueArgsState.id === currentArgsUniqueId ) {
					clearTimeout( uniqueArgsState.handler );
					return false;
				}

				return true;
			} );

			// Anyway if `options.debounceHistory` set to be true, we create timeout for saving log history.
			Debounce.uniqueArgsStates.push( {
				id: currentArgsUniqueId,
				handler: setTimeout( this.onDebounceTimeout.bind( this ), DEFAULT_DEBOUNCE_DELAY ),
			} );

			// Init || Update timer.
			Debounce.timer = now;
		} else {
			Debounce.action = 'normal';
		}

		Debounce.lastUniqueArgsId = currentArgsUniqueId;

		return !! Debounce.action;
	}

	onAfterApply( args, result ) {
		if ( this.isHistoryActive() ) {
			if ( 'normal' === Debounce.action ) {
				this.runHookAfter();
				this.constructor.logHistory( args );
			} else if ( 'debounce' === Debounce.action && this.historyId ) {
				Debounce.lastHistoryId = this.historyId;
			}
		}
	}

	/**
	 * Function onDebounceTimeout().
	 *
	 * On each debounce that reached timeout.
	 */
	onDebounceTimeout() {
		this.runHookAfter();
		this.constructor.logHistory( this.args, Debounce.lastHistoryId );
	}
}
