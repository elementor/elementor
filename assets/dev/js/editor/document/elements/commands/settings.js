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

		historyItem.get( 'elements' ).forEach( ( element ) => {

			// Re-find the element.
			if ( element.isDestroyed ) {

				element = elementorCommon.helpers.findViewRecursive(
					elementor.getPreviewView().children,
					'id',
					element.model.id,
					false
				);

				element = element[ 0 ];
			}

			const changes = data.changes[ element.model.id ];

			$e.run( 'document/elements/settings', {
				element,
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
		const { elements = [ args.element ], settings } = args,
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
				if ( 'undefined' !== typeof element.oldValues[ settingKey ] ) {
					changes[ id ].old[ settingKey ] = elementorCommon.helpers.cloneObject( element.oldValues[ settingKey ] );
					changes[ id ].new[ settingKey ] = settings[ settingKey ];
				}
			} );

			delete element.oldValues;
		} );

		$e.run( 'document/history/addItem', {
			elements,
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
		this.requireElements( args );
		this.requireArgument( 'settings', args );
	}

	getHistory( args ) {
		// Manual history.
		return false;
	}

	apply( args ) {
		const { settings, options = {}, elements = [ args.element ] } = args;

		elements.forEach( ( element ) => {
			const settingsModel = element.getEditModel().get( 'settings' );

			element.oldValues = element.oldValues || settingsModel.toJSON();

			if ( options.external ) {
				settingsModel.setExternalChange( settings );
			} else {
				settingsModel.set( settings );
			}
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
