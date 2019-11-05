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
	 * Function restore().
	 *
	 * Redo/Restore.
	 *
	 * @param {{}} historyItem
	 * @param {boolean} isRedo
	 */
	static restore( historyItem, isRedo ) {
		throw Error( 'static restore() should be implemented, please provide static restore functionality.' );
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
	static getArgsUniqueId( args ) {
		const { containers = [ args.container ], settings = {} } = args;

		return containers.map(
			( container ) => container.id
		).join( ',' ) + ',' + Object.keys( settings );
	}

	static clearUniqueArgsStates( args ) {
		const currentArgsUniqueId = Debounce.getArgsUniqueId( args );

		// Clear all hooks with the same unique args state.
		Debounce.uniqueArgsStates = Debounce.uniqueArgsStates.filter( ( uniqueArgsState ) => {
			if ( uniqueArgsState.id === currentArgsUniqueId ) {
				clearTimeout( uniqueArgsState.handler );
				return false;
			}

			return true;
		} );
	}

	initialize( args ) {
		super.initialize();

		const { containers = [ args.container ] } = args;

		// Save for later use.
		containers.forEach( ( container ) => {
			container.oldValues = container.oldValues || container.settings.toJSON();
		} );
	}

	getHistory( args ) {
		if ( ! this.isHistoryActive() ) {
			return false;
		}

		// Clear the action first.
		Debounce.action = '';

		const { options = {} } = args,
			currentArgsUniqueId = Debounce.getArgsUniqueId( args );

		if ( options.debounceHistory ) {
			// Get current time.
			const now = ( new Date() ).getTime();

			// If no timer or `DEFAULT_DEBOUNCE_DELAY` passed from last stimulation.
			if ( ! Debounce.timer || now - Debounce.timer > DEFAULT_DEBOUNCE_DELAY ) {
				Debounce.action = 'debounce';
			}

			// Clear all current snapshots.
			Debounce.clearUniqueArgsStates( args );

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

	/**
	 * Function logHistory().
	 *
	 * Do the actual history logging.
	 *
	 * @param {{}} args
	 * @param {number|boolean} historyId
	 */
	logHistory( args, historyId = false ) {
		const { containers = [ args.container ], settings = {}, isMultiSettings = false, options = {} } = args,
			changes = {};

		containers.forEach( ( container ) => {
			const { id } = container,
				newSettings = isMultiSettings ? settings[ container.id ] : settings;

			if ( ! changes[ id ] ) {
				changes[ id ] = {};
			}

			if ( ! changes[ id ].old ) {
				changes[ id ] = {
					old: {},
					new: {},
				};
			}

			Object.keys( newSettings ).forEach( ( settingKey ) => {
				if ( 'undefined' !== typeof container.oldValues[ settingKey ] ) {
					changes[ id ].old[ settingKey ] = elementorCommon.helpers.cloneObject( container.oldValues[ settingKey ] );
					changes[ id ].new[ settingKey ] = newSettings[ settingKey ];
				}
			} );

			delete container.oldValues;
		} );

		let historyItem = {
			containers,
			data: { changes },
			type: 'change',
			restore: this.constructor.restore,
		};

		if ( options.history ) {
			historyItem = Object.assign( options.history, historyItem );
		}

		if ( historyId ) {
			historyItem = Object.assign( { id: historyId }, historyItem );
		}

		$e.run( 'document/history/add-sub-item', historyItem );
	}

	onBeforeApply( args ) {
		try {
			$e.hooks.runDependency( this.currentCommand, args );
		} catch ( e ) {
			// TODO: `Break-Hook` Should be const.
			if ( 'Break-Hook' === e ) {
				const currentArgsUniqueId = Debounce.getArgsUniqueId( args );

				// Clear all hooks with the same unique args state.
				Debounce.clearUniqueArgsStates( args );
			}

			// Resume Break-Hook.
			throw e;
		}
	}

	onAfterApply( args, result ) {
		if ( this.isHistoryActive() ) {
			if ( 'normal' === Debounce.action ) {
				super.onAfterApply( args, result );

				this.logHistory( args );
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
		$e.hooks.runAfter( this.currentCommand, this.args );

		this.logHistory( this.args, Debounce.lastHistoryId );

		Debounce.clearUniqueArgsStates( this.args );
	}
}
