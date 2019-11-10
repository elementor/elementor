import Debounce from '../../commands/base/debounce';

export class Settings extends Debounce {
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
			settingsKeys = Object.keys( settings ),
			controls = containers[ 0 ].controls,
			firstSettingKey = settingsKeys[ 0 ];

		let result = '';

		if ( ! isMultiSettings && 1 === settingsKeys.length && controls && controls[ firstSettingKey ] ) {
			result = controls[ firstSettingKey ].label;
		}

		return result;
	}

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

	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentConstructor( 'settings', Object, args );
	}

	getHistory( args ) {
		if ( ! super.getHistory( args ) ) {
			return false;
		}

		const { containers = [ args.container ], options = {} } = args,
			subTitle = this.constructor.getSubTitle( args );

		let history = {
			containers,
			subTitle,
			type: 'change',
		};

		if ( options.history ) {
			history = Object.assign( options.history, history );
		}

		return history;
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
