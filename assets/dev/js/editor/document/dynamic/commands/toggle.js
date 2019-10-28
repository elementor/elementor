import Base from '../../commands/base';
import ElementsSettings from '../../elements/commands/settings';

export class Toggle extends Base {
	static restore( historyItem, isRedo ) {
		const data = historyItem.get( 'data' );

		isRedo = ( data.status === isRedo );

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
		this.requireArgumentConstructor( 'status', Boolean, args );
	}

	getHistory( args ) {
		const { settings, containers = [ args.container ], status } = args,
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
			data: { changes, status },
			type: 'change',
			restore: this.constructor.restore,
		};
	}

	apply( args ) {
		const { settings, containers = [ args.container ], status } = args;

		containers.forEach( ( container ) => {
			if ( status ) {
				this.enable( container, settings );
			} else {
				this.disable( container, settings );
			}

			container.settings.set( '__dynamic__', container.dynamic.toJSON() );

			container.render();
		} );
	}

	/**
	 * Function enable().
	 *
	 * Enable dynamic mode.
	 *
	 * @param {Container} container
	 * @param {{}} settings
	 */
	enable( container, settings ) {
		if ( ! Object.keys( settings ).length ) {
			container.dynamic.clear();
		} else {
			container.dynamic.set( settings );
		}
	}

	/**
	 * Function disable().
	 *
	 * Disable dynamic mode.
	 *
	 * @param {Container} container
	 * @param {{}} settings
	 */
	disable( container, settings ) {
		Object.keys( settings ).forEach( ( setting ) => {
			container.dynamic.unset( setting );
		} );
	}
}

export default Toggle;
