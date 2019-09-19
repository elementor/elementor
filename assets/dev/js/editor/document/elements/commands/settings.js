import Base from '../../commands/base';

// Settings.
export default class Settings extends Base {
	/**
	 * @type {function( args )}
	 */
	static lazyHistory;

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
	static logHistory( args ) {
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

		const settingsKeys = Object.keys( settings );

		let subTitle = '';

		if ( ! isMultiSettings && 1 === settingsKeys.length && containers[ 0 ].controls[ settingsKeys[ 0 ] ] ) {
			subTitle = containers[ 0 ].controls[ settingsKeys[ 0 ] ].label;
		}

		let historyItem = {
			containers,
			data: { changes },
			type: 'change',
			subTitle: subTitle,
			restore: Settings.restore,
		};

		if ( options.history ) {
			historyItem = Object.assign( options.history, historyItem );
		}

		$e.run( 'document/history/addItem', historyItem );
	}

	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentConstructor( 'settings', Object, args );
	}

	getHistory( args ) {
		// Manual history.
		return false;
	}

	apply( args ) {
		const { containers = [ args.container ], settings = {}, isMultiSettings = false, options = {} } = args;

		containers.forEach( ( container ) => {
			const newSettings = isMultiSettings ? settings[ container.id ] : settings;

			container.oldValues = container.oldValues || container.settings.toJSON();

			if ( options.external ) {
				container.settings.setExternalChange( newSettings );
			} else {
				container.settings.set( newSettings );
			}

			container.render();
		} );

		if ( elementor.history.history.getActive() ) {
			if ( options.lazy ) {
				Settings.lazyHistory( args );
			} else {
				Settings.logHistory( args );
			}
		}
	}
}

Settings.lazyHistory = _.debounce( Settings.logHistory, 800 );
