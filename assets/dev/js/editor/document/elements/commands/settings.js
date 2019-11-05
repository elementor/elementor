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
