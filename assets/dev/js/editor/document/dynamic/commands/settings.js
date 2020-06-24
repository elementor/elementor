import CommandHistoryDebounce from 'elementor-document/commands/base/command-history-debounce';
import ElementsSettings from 'elementor-document/elements/commands/settings';

/**
 * The difference between 'document/elements/settings` and `document/dynamic/settings` is:
 * that `document/elements/settings` apply settings to `container.settings` and `document/dynamic/settings` affect
 * `container.settings.__dynamic__`, also clearing the dynamic if `args.settings` is empty.
 */
export class Settings extends CommandHistoryDebounce {
	static restore( historyItem, isRedo ) {
		const data = historyItem.get( 'data' );

		historyItem.get( 'containers' ).forEach( ( container ) => {
			const changes = data.changes[ container.id ];

			$e.run( 'document/dynamic/settings', {
				container,
				settings: isRedo ? changes.new : changes.old,
			} );

			container.panel.refresh();
		} );
	}

	validateArgs( args ) {
		this.requireContainer( args );

		this.requireArgumentConstructor( 'settings', Object, args );
	}

	getHistory( args ) {
		const { settings, containers = [ args.container ] } = args,
			changes = {};

		containers.forEach( ( container ) => {
			const { id } = container;

			if ( ! changes[ id ] ) {
				changes[ id ] = {};
			}

			changes[ id ] = {
				old: container.dynamic.toJSON(),
				new: settings,
			};
		} );

		const subTitle = ElementsSettings.getSubTitle( args );

		return {
			containers,
			subTitle,
			data: { changes },
			type: 'change',
			restore: this.constructor.restore,
		};
	}

	apply( args ) {
		const { settings, containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			container = container.lookup();

			if ( ! Object.keys( settings ).length ) {
				container.dynamic.clear();
			} else {
				container.dynamic.set( settings );
			}

			container.settings.set( '__dynamic__', container.dynamic.toJSON() );

			container.render();
		} );
	}
}

export default Settings;
