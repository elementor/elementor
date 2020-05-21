import CommandHistory from 'elementor-document/commands/base/command-history';
import ElementsSettings from 'elementor-document/elements/commands/settings';
import DocumentCache from 'elementor-editor/data/globals/helpers/document-cache';

export default class DisableEnable extends CommandHistory {
	static restore( historyItem, isRedo ) {
		const data = historyItem.get( 'data' );

		// Upon `disable` command toggle `isRedo`.
		if ( 'document/globals/disable' === data.command ) {
			isRedo = ! isRedo;
		}

		historyItem.get( 'containers' ).forEach( ( container ) => {
			const settings = data.changes[ container.id ],
				toggle = isRedo ? 'document/globals/enable' : 'document/globals/disable';

			$e.run( toggle, {
				container,
				settings,
			} );

			container.panel.refresh();
		} );
	}

	initialize( args ) {
		super.initialize( args );

		/**
		 * Which command is running.
		 *
		 * @type {string}
		 */
		this.type = 'document/globals/enable' === this.currentCommand ?
			'enable' : 'disable';
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

			changes[ id ] = settings;
		} );

		const subTitle = elementor.translate( 'globals' ) + ' ' + ElementsSettings.getSubTitle( args ),
			type = this.type;

		return {
			containers,
			subTitle,
			data: {
				changes,
				command: this.currentCommand,
			},
			type,
			restore: this.constructor.restore,
		};
	}

	onAfterRun( args, result ) {
		super.onAfterRun( args, result );

		const { containers = [ args.container ] } = args;

		DocumentCache.updateSettingsByContainers( containers, { __globals__: args.settings } );
	}

	isDataChanged() {
		return true;
	}
}
