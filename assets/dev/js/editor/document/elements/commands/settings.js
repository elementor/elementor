/**
 * @typedef {import('../../../container/container')} Container
 */
export class Settings extends $e.modules.editor.document.CommandHistoryDebounceBase {
	/**
	 * Function getSubTitle().
	 *
	 * Get sub title by container.
	 *
	 * @param {{}} args
	 *
	 * @return {string} sub title
	 */
	static getSubTitle( args ) {
		const { containers = [ args.container ], settings = {}, isMultiSettings } = args,
			settingsKeys = Object.keys( settings ),
			controls = containers[ 0 ].controls,
			firstSettingKey = settingsKeys[ 0 ];

		let result = '';

		if ( ! isMultiSettings && 1 === settingsKeys.length && controls && controls[ firstSettingKey ] ) {
			result = controls[ firstSettingKey ].label;
		}

		return result;
	}

	/**
	 * Function restore().
	 *
	 * Redo/Restore.
	 *
	 * @param {{}}      historyItem
	 * @param {boolean} isRedo
	 */
	static restore( historyItem, isRedo ) {
		const data = historyItem.get( 'data' );

		historyItem.get( 'containers' ).forEach( ( /* Container */ container ) => {
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
	 * Function addToHistory().
	 *
	 * @param {Container} container
	 * @param {{}}        newSettings
	 * @param {{}}        oldSettings
	 */
	addToHistory( container, newSettings, oldSettings ) {
		const changes = {
				[ container.id ]: {
					old: oldSettings,
					new: newSettings,
				},
			},
			historyItem = {
				containers: [ container ],
				data: { changes },
				type: 'change',
				restore: Settings.restore,
			};

		$e.internal( 'document/history/add-transaction', historyItem );
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
			const newSettings = isMultiSettings ? settings[ container.id ] : settings,
				oldSettings = container.settings.toJSON();

			// Clear old oldValues.
			container.oldValues = {};

			// Set oldValues, For each setting is about to change save setting value.
			Object.keys( newSettings ).forEach( ( key ) => {
				container.oldValues[ key ] = oldSettings[ key ];
			} );

			// If history active, add history transaction with old and new settings.
			if ( this.isHistoryActive() ) {
				this.addToHistory( container, newSettings, container.oldValues );
			}

			$e.internal( 'document/elements/set-settings', {
				container,
				options,
				settings: newSettings,
			} );
		} );
	}
}

export default Settings;
