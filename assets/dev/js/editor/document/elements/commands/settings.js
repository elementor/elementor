import History from '../../commands/base/history';

export class Settings extends History {
	/**
	 * Function getSubTitle().
	 *
	 * Get sub title by container.
	 *
	 * @param {{}} args
	 *
	 * @returns {string}
	 */
	static getSubTitle( args ) {
		const { containers = [ args.container ], settings = {}, isMultiSettings } = args,
			settingsKeys = Object.keys( settings );

		let result = '';

		if ( ! isMultiSettings &&
			1 === settingsKeys.length &&
			containers[ 0 ].controls &&
			containers[ 0 ].controls[ settingsKeys[ 0 ] ] ) {
			result = containers[ 0 ].controls[ settingsKeys[ 0 ] ].label;
		}

		return result;
	}

	/**
	 * Function restore().
	 *
	 * Redo/Restore.
	 *
	 * @param {{}} historyItem
	 * @param {boolean} isRedo
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

	static logHistory( container, newSettings ) {
		const changes = {
				[ container.id ]: {
					old: container.settings.toJSON(),
					new: newSettings,
				},
			},
			historyItem = {
				containers: [ container ],
				data: { changes },
				type: 'change',
				restore: Settings.restore,
			};

		$e.run( 'document/history/add-log', historyItem );
	}

	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentConstructor( 'settings', Object, args );
	}

	getHistory( args ) {
		const { containers = [ args.container ] } = args,
			subTitle = this.constructor.getSubTitle( args );

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

			/**
			 * Settings support multi settings for each container, eg use:
			 * settings: { '{ container-id }': { someSettingKey: someSettingValue } } etc.
			 */
			const newSettings = isMultiSettings ? settings[ container.id ] : settings;

			// Save for debounce.
			this.constructor.logHistory( container, newSettings );

			if ( options.external ) {
				container.settings.setExternalChange( newSettings );
			} else {
				container.settings.set( newSettings );
			}

			container.render();
		} );
	}

	isDataChanged() {
		return true;
	}
}

export default Settings;
