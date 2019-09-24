import Base from '../../commands/base';

const DEBOUNCE_DELAY = 1000; // 1 second.

// Settings.
export default class Settings extends Base {
	/**
	 * Array of Object(s) { id = 'id of args snapshot', handler = ' return value of setTimeout ' }.
	 *
	 * @type {Array}
	 */
	static snapshots = [];

	/**
	 * Each stimulation we save the unique `this.args` sate id.
	 *
	 * @type {String}
	 */
	static lastSnapshot = '';

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
	 * Function restore.
	 *
	 * Restore Settings.
	 *
	 * @param {{}} historyItem
	 * @param {Boolean} isRedo
	 */
	static restore( historyItem, isRedo ) {
		const data = historyItem.get( 'data' );

		historyItem.get( 'containers' ).forEach( ( container ) => {
			const changes = data.changes[ container.id ];

			$e.run( 'document/elements/settings', {
				container,
				settings: isRedo ? changes.new : changes.old,
				options: {
					external: true,
				},
			} );
		} );
	}

	/**
	 * Function logHistory.
	 *
	 * Log history for settings command.
	 *
	 * @param {{}} args
	 */
	static logHistory( args, historyId = false ) {
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
			restore: Settings.restore,
		};

		if ( options.history ) {
			historyItem = Object.assign( options.history, historyItem );
		}

		if ( historyId ) {
			historyItem = Object.assign( { id: historyId }, historyItem );
		}

		$e.run( 'document/history/addSubItem', historyItem );
	}

	initialize() {
		this.historyAction = false;
	}

	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentConstructor( 'settings', Object, args );
	}

	getArgsSnapshotId( args ) {
		const { containers = [ args.container ], settings = {} } = args;

		return containers.map( ( container ) => container.id ).join( ',' ) + ',' + Object.keys( settings );
	}

	getHistory( args ) {
		if ( ! this.isHistoryActive() ) {
			return false;
		}

		const { options = {} } = args,
			currentArgsSnapshot = this.getArgsSnapshotId( args );

		// Get current time.
		const now = ( new Date() ).getTime();

		if ( options.debounceHistory ) {
			// If no timer or 1 second passed from last simulation.
			if ( ! this.constructor.debounceTimer || now - this.constructor.debounceTimer > DEBOUNCE_DELAY ) {
				this.historyAction = 'debounce';
			}

			// Clear all current snapshots
			this.constructor.snapshots = this.constructor.snapshots.filter( ( snapshot ) => {
				if ( snapshot.id === currentArgsSnapshot ) {
					clearTimeout( snapshot.handler );
					return false;
				}

				return true;
			} );

			// Anyway if debounceHistory set to be true, we create timeout for saving log history.
			this.constructor.snapshots.push( {
				id: currentArgsSnapshot,
				handler: setTimeout( () => {
					this.constructor.logHistory( args, this.constructor.debounceHistoryId );
				}, 1000 ),
			} );

			// Init || Update timer.
			this.constructor.debounceTimer = now;
		} else {
			this.historyAction = 'normal';
		}

		if ( ! this.historyAction ) {
			return false;
		}

		this.constructor.lastSnapshot = currentArgsSnapshot;

		const { containers = [ args.container ], settings = {}, isMultiSettings = false } = args,
			settingsKeys = Object.keys( settings );

		let subTitle = '';

		if ( ! isMultiSettings &&
			1 === settingsKeys.length &&
			containers[ 0 ].controls &&
			containers[ 0 ].controls[ settingsKeys[ 0 ] ] ) {
			subTitle = containers[ 0 ].controls[ settingsKeys[ 0 ] ].label;
		}

		return {
			containers,
			subTitle,
			type: 'change',
		};
	}

	apply( args ) {
		const { containers = [ args.container ], settings = {}, isMultiSettings = false, options = {} } = args;

		containers.forEach( ( container ) => {
			container = container.lookup();

			const newSettings = isMultiSettings ? settings[ container.id ] : settings;

			container.oldValues = container.oldValues || container.settings.toJSON();

			if ( options.external ) {
				container.settings.setExternalChange( newSettings );
			} else {
				container.settings.set( newSettings );
			}

			container.render();
		} );

		if ( this.isHistoryActive() ) {
			if ( 'debounce' === this.historyAction && this.historyId ) {
				this.constructor.debounceHistoryId = this.historyId;
			} else if ( 'normal' === this.historyAction ) {
				this.constructor.logHistory( args );
			}
		}
	}
}
