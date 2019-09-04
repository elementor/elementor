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

			$e.run( 'document/elements/repeater/settings', {
				container,
				name: data.name,
				index: data.index,
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
		const { name, index, settings } = args,
			containers = args.containers || [ args.container ],
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
				changes[ id ].old[ settingKey ] = elementorCommon.helpers.cloneObject( container.oldValues[ settingKey ] );
				changes[ id ].new[ settingKey ] = settings[ settingKey ];
			} );

			delete container.oldValues;
		} );

		$e.run( 'document/history/addItem', {
			containers,
			data: {
				changes,
				name,
				index,
			},
			type: 'change',
			subTitle: elementor.translate( 'Item' ),
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
		this.requireArgument( 'name', args );
		this.requireArgument( 'index', args );
	}

	getHistory( args ) {
		// Manual history.
		return false;
	}

	apply( args ) {
		const { settings, name, index, options = {}, containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			const collection = container.settings.get( name ),
				item = collection.at( index );

			container.oldValues = container.oldValues || item.toJSON();

			item.set( settings );

			// TODO: handle/remove this trigger.
			if ( ! options.hasOwnProperty( 'trigger' ) || options.trigger ) {
				Object.entries( settings ).forEach( ( setting ) => {
					collection.models[ index ].trigger( `change:external:${ setting[ 0 ] }`, setting[ 1 ] );
				} );
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
