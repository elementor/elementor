import Base from '../../../commands/base';
import ElementsSettings from '../../../elements/commands/settings';

export default class DisableEnable extends Base {
	static restore( historyItem, isRedo ) {
		const data = historyItem.get( 'data' );

		// Upon `disable` command toggle `isRedo`.
		if ( 'document/dynamic/disable' === data.command ) {
			isRedo = ! isRedo;
		}

		historyItem.get( 'containers' ).forEach( ( container ) => {
			const settings = data.changes[ container.id ],
				toggle = isRedo ? 'enable' : 'disable';

			$e.run( `document/dynamic/${ toggle }`, {
				container,
				settings,
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

			changes[ id ] = settings;
		} );

		const subTitle = ElementsSettings.getSubTitle( args );

		return {
			containers,
			subTitle,
			data: {
				changes,
				command: this.currentCommand,
			},
			type: 'change',
			restore: this.constructor.restore,
		};
	}
}
