import Base from './base';

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
		const { containers = [ args.container ], settings } = args,
			changes = {};

		containers.forEach( ( container ) => {
			const { id } = container;

			if ( ! changes[ id ] ) {
				changes[ id ] = {};
			}

			if ( ! changes[ id ].old ) {
				changes[ id ] = {
					old: {},
					new: {},
				};
			}

			Object.keys( settings ).forEach( ( settingKey ) => {
				if ( 'undefined' !== typeof container.oldValues[ settingKey ] ) {
					changes[ id ].old[ settingKey ] = elementorCommon.helpers.cloneObject( container.oldValues[ settingKey ] );
					changes[ id ].new[ settingKey ] = settings[ settingKey ];
				}
			} );

			delete container.oldValues;
		} );

		$e.run( 'document/history/addItem', {
			containers,
			data: { changes },
			type: 'change',
			history: {
				behavior: {
					restore: Settings.restore,
				},
			},
		} );
	}

	validateArgs( args ) {
		this.requireContainer( args );
		this.requireArgument( 'settings', args );
	}

	getHistory( args ) {
		// Manual history.
		return false;
	}

	apply( args ) {
		const { settings, options = {}, containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			container.oldValues = container.oldValues || container.settings.toJSON();

			if ( options.external ) {
				container.settings.setExternalChange( settings );
			} else {
				container.settings.set( settings );
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
