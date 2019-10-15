import Debounce from '../../commands/debounce';

const COMMAND_DEBOUNCE_DELAY = 800; // ms.

export class Settings extends Debounce {
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

	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentConstructor( 'settings', Object, args );
	}

	getDebounceDelay() {
		return COMMAND_DEBOUNCE_DELAY;
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

			const newSettings = isMultiSettings ? settings[ container.id ] : settings;

			// Save for debounce.
			container.oldValues = container.oldValues || container.settings.toJSON();

			if ( options.external ) {
				container.settings.setExternalChange( newSettings );
			} else {
				container.settings.set( newSettings );
			}

			container.render();
		} );
	}
}

export default Settings;
