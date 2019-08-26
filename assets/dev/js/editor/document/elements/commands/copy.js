import Base from './base';

// Copy.
export default class extends Base {
	validateArgs( args ) {
		this.requireElements( args );
	}

	getHistory( args ) {
		// No history required for the command.
		return false;
	}

	apply( args ) {
		const { storageKey = 'transfer', elements = [ args.element ], elementsType = elements[ 0 ].elType } = args,
			cloneElements = elements.map( ( element ) => {
			return element.model.toJSON( { copyHtmlCache: true } );
		} );

		elementorCommon.storage.set( storageKey, {
			type: 'copy',
			elements: cloneElements,
			elementsType,
		} );
	}
}
