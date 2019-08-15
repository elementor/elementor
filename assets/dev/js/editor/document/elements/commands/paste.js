import Base from './base';

// Paste.
export default class extends Base {
	apply() {
		const { args } = this;

		if ( ! args.element && ! args.elements ) {
			throw Error( 'element or elements are required.' );
		}

		if ( args.element && args.elements ) {
			throw Error( 'element and elements cannot go together please select one of them.' );
		}

		if ( args.element ) {
			args.elements = [ args.element ];
		}

		if ( ! args.storageKey ) {
			args.storageKey = 'transfer';
		}

		const transferData = elementorCommon.storage.get( args.storageKey );

		if ( ! transferData.hasOwnProperty( 'elements' ) ) {
			throw Error( `storage with key: '${ args.storageKey }' does not have elements` );
		}

		// TODO: should it be member of this class?
		const pasteTo = ( elements, options = {} ) => {
			options = Object.assign( { at: null, clone: true }, options );

			transferData.elements.forEach( function( data ) {
				$e.run( 'document/elements/create', {
					elements,
					data,
					options,
				} );

				// On paste sections, increase the `at` for every section.
				if ( null !== options.at ) {
					options.at++;
				}
			} );
		};

		// Paste on "Add Section" area.
		if ( args.rebuild ) {
			args.elements.forEach( ( currentElement ) => {
				const at = 'undefined' === typeof args.at ? currentElement.collection.length : args.at;

				if ( 'section' === transferData.elementsType ) {
					pasteTo( [ currentElement ], {
						at,
						edit: false,
					} );
				} else if ( 'column' === transferData.elementsType ) {
					const section = $e.run( 'document/elements/create', {
						element: currentElement,
						options: {
							at,
							edit: false,
						},
						returnValue: true,
					} );

					pasteTo( [ section ] );

					section.resizeColumns();
				} else {
					// Next code changed from original since `_checkIsEmpty()` was removed.
					const section = $e.run( 'document/elements/createSection', {
						options: {
							at,
						},
						columns: 1,
						returnValue: true,
					} );

					pasteTo( [ section ] );
				}
			} );
		} else {
			pasteTo( args.elements );
		}
	}
}
