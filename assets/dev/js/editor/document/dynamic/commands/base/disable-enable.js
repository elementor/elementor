import History from '../../../commands/base/history';
import ElementsSettings from '../../../elements/commands/settings';

export default class DisableEnable extends History {
	static restore( historyItem, isRedo ) {
		const data = historyItem.get( 'data' );

		// Upon `disable` command toggle `isRedo`.
		if ( 'document/dynamic/disable' === data.command ) {
			isRedo = ! isRedo;
		}

		historyItem.get( 'containers' ).forEach( ( container ) => {
			const settings = data.changes[ container.id ],
				toggle = isRedo ? 'document/dynamic/enable' : 'document/dynamic/disable';

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
		this.type = 'document/dynamic/enable' === this.currentCommand ?
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

		const subTitle = elementor.translate( 'dynamic' ) + ' ' + ElementsSettings.getSubTitle( args ),
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

	isDataChanged() {
		return true;
	}
}
