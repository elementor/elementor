import Base from './base';

// Copy.
export default class extends Base {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	getHistory( args ) {
		// No history required for the command.
		return false;
	}

	apply( args ) {
		const { storageKey = 'transfer', containers = [ args.container ], elementsType = containers[ 0 ].model.elType } = args,
			cloneContainers = containers.map( ( container ) => {
			return container.model.toJSON( { copyHtmlCache: true } );
		} );

		elementorCommon.storage.set( storageKey, {
			type: 'copy',
			containers: cloneContainers,
			elementsType,
		} );
	}
}
