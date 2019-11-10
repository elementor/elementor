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

/**
 * Debounce class was created since basic debounce does not handle scenarios that each args are unique flow.
 * TODO: All `uniqueArgs*` properties should be under one array.
 * TODO: Refactor.
 */
export default class Debounce extends History {
	/**
	 * History id per uniqueArgs.
	 *
	 * @type {{}.<number>}
	 */
	static uniqueArgsHistoryId = {};

	/**
	 * Timer per uniqueArgs.
	 *
	 * @type {{}.<number>}
	 */
	static uniqueArgsTimer = {};

	/**
	 * Action per uniqueArgs.
	 *
	 * @type {{}.<string>}
	 */
	static uniqueArgsAction = {};

	/**
	 * Old values per uniqueArgs.
	 *
	 * @type {{}}
	 */
	static uniqueArgsOldValues = {};

	/**
	 * Array of UniqueArgsState
	 *
	 * @type {Array.<UniqueArgsState>}
	 */
	static uniqueArgsStates = [];

	/**
	 * Function restore().
	 *
	 * Redo/Restore.
	 *
	 * @param {{}} historyItem
	 * @param {boolean} isRedo
	 */
	static restore( historyItem, isRedo ) {
		Debounce.forceMethodImplementation( 'restore', true );
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

	/**
	 * Function clearUniqueArgsStates().
	 *
	 * Clear all states & timeout for current args unique id.
	 *
	 * @param {{}} args
	 */
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

	static clearUniqueArgsStatesHolders( args ) {
		Debounce.clearUniqueArgsStates( args );

		const currentArgsUniqueId = Debounce.getArgsUniqueId( args );

		delete Debounce.uniqueArgsHistoryId[ currentArgsUniqueId ];
		delete Debounce.uniqueArgsTimer[ currentArgsUniqueId ];
		delete Debounce.uniqueArgsAction[ currentArgsUniqueId ];

		Debounce.deleteOldValues( args );
	}

	static getAction( args ) {
		return Debounce.uniqueArgsAction[ Debounce.getArgsUniqueId( args ) ];
	}

	static setAction( args, action ) {
		Debounce.uniqueArgsAction[ Debounce.getArgsUniqueId( args ) ] = action;
	}

	static getTimer( args ) {
		return Debounce.uniqueArgsTimer[ Debounce.getArgsUniqueId( args ) ];
	}

	static setTimer( args, timer ) {
		Debounce.uniqueArgsTimer[ Debounce.getArgsUniqueId( args ) ] = timer;
	}

	static getHistoryId( args ) {
		return Debounce.uniqueArgsHistoryId[ Debounce.getArgsUniqueId( args ) ];
	}

	static setHistoryId( args, historyId ) {
		Debounce.uniqueArgsHistoryId[ Debounce.getArgsUniqueId( args ) ] = historyId;
	}

	static saveOldValues( args ) {
		const { containers = [ args.container ] } = args,
			currentArgsUniqueId = Debounce.getArgsUniqueId( args );

		// If there is already old values not assign required.
		if ( Debounce.uniqueArgsOldValues[ currentArgsUniqueId ] ) {
			return;
		}

		containers.forEach( ( /** Container */ container ) => {
			if ( ! Debounce.uniqueArgsOldValues[ currentArgsUniqueId ] ) {
				Debounce.uniqueArgsOldValues[ currentArgsUniqueId ] = {};
			}

			Debounce.uniqueArgsOldValues[ currentArgsUniqueId ][ container.id ] = container.settings.toJSON();
		} );
	}

	static deleteOldValues( args ) {
		const currentArgsUniqueId = Debounce.getArgsUniqueId( args );

		delete Debounce.uniqueArgsOldValues[ currentArgsUniqueId ];
	}

	static getChanges( args ) {
		const { containers = [ args.container ], settings = {}, isMultiSettings = false } = args,
			changes = {},
			currentArgsUniqueId = Debounce.getArgsUniqueId( args );

		containers.forEach( ( /** Container */ container ) => {
			const { id } = container,
				newSettings = isMultiSettings ? settings[ id ] : settings;

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
				const oldValues = Debounce.uniqueArgsOldValues[ currentArgsUniqueId ];

				if ( 'undefined' !== typeof oldValues[ id ][ settingKey ] ) {
					changes[ id ].old[ settingKey ] = elementorCommon.helpers.cloneObject( oldValues[ id ][ settingKey ] );
					changes[ id ].new[ settingKey ] = newSettings[ settingKey ];
				}
			} );
		} );

		return changes;
	}

	initialize( args ) {
		super.initialize();

		if ( this.isHistoryActive() ) {
			Debounce.saveOldValues( args );
		}
	}

	getHistory( args ) {
		if ( ! this.isHistoryActive() ) {
			return false;
		}

		const { options = {} } = args;

		// Clear the action first.
		Debounce.setAction( args, '' );

		if ( options.debounceHistory ) {
			// Get current time.
			const now = ( new Date() ).getTime(),
				timer = Debounce.getTimer( args );

			// If no timer or `DEFAULT_DEBOUNCE_DELAY` passed from last stimulation.
			if ( ! timer || now - timer > DEFAULT_DEBOUNCE_DELAY ) {
				Debounce.setAction( args, 'debounce' );
			}

			// Clear all current snapshots.
			Debounce.clearUniqueArgsStates( args );

			// Anyway if `options.debounceHistory` set to be true, we create timeout for saving log history.
			Debounce.uniqueArgsStates.push( {
				id: Debounce.getArgsUniqueId( args ),
				handler: setTimeout( this.onDebounceTimeout.bind( this ), DEFAULT_DEBOUNCE_DELAY ),
			} );

			// Init || Update timer.
			Debounce.setTimer( args, now );
		} else {
			Debounce.setAction( args, 'normal' );
		}

		return !! Debounce.getAction( args );
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
		const { containers = [ args.container ], options = {} } = args,
			changes = Debounce.getChanges( args );

		Debounce.deleteOldValues( args );

		let historyItem = {
			containers,
			data: { changes },
			type: 'change',
			restore: this.constructor.restore,
		};

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
				// Clear all hooks with the same unique args state.
				Debounce.clearUniqueArgsStatesHolders( args );
			}

			// Resume Break-Hook.
			throw e;
		}
	}

	onAfterApply( args, result ) {
		if ( this.isHistoryActive() ) {
			const action = Debounce.getAction( args );

			if ( 'normal' === action ) {
				super.onAfterApply( args, result );

				this.logHistory( args );
			} else if ( 'debounce' === action && this.historyId ) {
				Debounce.setHistoryId( args, this.historyId );
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

		this.logHistory( this.args, Debounce.getHistoryId( this.args ) );

		Debounce.clearUniqueArgsStatesHolders( this.args );
	}
}
