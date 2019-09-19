import Base from '../../commands/base';

export default class extends Base {
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

		const settingsKeys = Object.keys( settings );

		/*
		* TODO: subTitle getting is code duplication create a common logic.
		* */
		let subTitle = '';

		if ( 1 === settingsKeys.length && containers[ 0 ].controls[ settingsKeys[ 0 ] ] ) {
			subTitle = containers[ 0 ].controls[ settingsKeys[ 0 ] ].label;
		}

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
