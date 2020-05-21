import CommandHistoryDebounce from 'elementor-document/commands/base/command-history-debounce';
import ElementsSettings from 'elementor-document/elements/commands/settings';
import DocumentCache from 'elementor-editor/data/globals/helpers/document-cache';

// Run when a global color is chosen while the active color is a different global color
export class Settings extends CommandHistoryDebounce {
	static restore( historyItem, isRedo ) {
		const data = historyItem.get( 'data' );

		historyItem.get( 'containers' ).forEach( ( container ) => {
			const changes = data.changes[ container.id ];

			$e.run( 'document/globals/settings', {
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
				old: container.globals.toJSON(),
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
				container.globals.clear();
			} else {
				container.globals.set( settings );
			}

			container.settings.set( '__globals__', container.globals.toJSON() );

			container.render();
		} );
	}

	onAfterRun( args, result ) {
		super.onAfterRun( args, result );

		const { containers = [ args.container ] } = args;

		DocumentCache.updateSettingsByContainers( containers, { __globals__: args.settings } );
	}
}

export default Settings;
