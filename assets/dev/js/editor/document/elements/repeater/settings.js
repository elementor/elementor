import Base from '../commands/base';

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

		historyItem.get( 'elements' ).forEach( ( element ) => {
			const changes = data.changes[ element.model.id ];

			$e.run( 'document/elements/repeater/settings', {
				element,
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
			elements = args.elements || [ args.element ],
			changes = {};

		elements.forEach( ( element ) => {
			const { id } = element.model;

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
				changes[ id ].old[ settingKey ] = elementorCommon.helpers.cloneObject( element.oldValues[ settingKey ] );
				changes[ id ].new[ settingKey ] = settings[ settingKey ];
			} );

			delete element.oldValues;
		} );

		$e.run( 'document/history/addItem', {
			elements,
			data: {
				changes,
				name,
				index,
			},
			type: 'change',
			subTitle: name,
			history: {
				behavior: {
					restore: Settings.restore,
				},
			},
		} );
	}

	once() {
		this.constructor.lazyHistory = _.debounce( this.constructor.logHistory, 800 );
	}

	getHistory() {
		// Manual history.
		return false;
	}

	validateArgs( args ) {
		this.requireElements( args );

		this.requireArgument( 'settings', args );
		this.requireArgument( 'name', args );
		this.requireArgument( 'index', args );
	}

	apply( args ) {
		const { settings, name, index, options = {}, elements = [ args.element ] } = args;

		elements.forEach( ( element ) => {
			const settingsModel = element.getEditModel().get( 'settings' ),
				collection = settingsModel.get( name ),
				item = collection.at( index );

			element.oldValues = element.oldValues || item.toJSON();

			item.set( settings );

			if ( ! options.hasOwnProperty( 'trigger' ) || options.trigger ) {
				Object.entries( settings ).forEach( ( setting ) => {
					collection.models[ index ].trigger( `change:external:${ setting[ 0 ] }`, setting[ 1 ] );
				} );
			}

			// TODO: not always needed (when history is active).
			element.renderOnChange( settingsModel );
		} );

		if ( elementor.history.history.getActive() ) {
			this.constructor.lazyHistory( args );
		}
	}
}
