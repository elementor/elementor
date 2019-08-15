import Base from './base';

// Copy.
export default class extends Base {
	apply() {
		const { args } = this;

		if ( ! args.element && ! args.elements ) {
			throw Error( 'element or elements are required.' );
		}

		if ( args.element && args.elements ) {
			throw Error( 'element and elements cannot go together please select one of them.' );
		}

		if ( ! args.storageKey ) {
			args.storageKey = 'transfer';
		}

		if ( args.element ) {
			args.elements = [ args.element ];
		}

		args.elements = args.elements.map( ( element ) => {
			return element.model.toJSON( { copyHtmlCache: true } );
		} );

		let elementsType = null;

		if ( args.elementsType ) {
			elementsType = args.elementsType;
		} else {
			elementsType = args.elements[ 0 ].elType;
		}

		elementorCommon.storage.set( args.storageKey, {
			type: 'copy',
			elements: args.elements,
			elementsType,
		} );
	}
}
