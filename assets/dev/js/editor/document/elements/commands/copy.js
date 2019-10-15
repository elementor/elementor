import Base from '../../commands/base';

export class Copy extends Base {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	getHistory( args ) {
		// No history required for the command.
		return false;
	}

	apply( args ) {
		const { storageKey = 'clipboard', containers = [ args.container ], elementsType = containers[ 0 ].model.elType } = args,
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

export default Copy;
