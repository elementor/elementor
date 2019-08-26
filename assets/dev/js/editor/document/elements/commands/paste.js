import Base from './base';

// Paste.
export default class extends Base {
	validateArgs( args ) {
		const { storageKey = 'transfer' } = args,
			transferData = elementorCommon.storage.get( storageKey );

		this.requireElements( args )

		if ( ! transferData.hasOwnProperty( 'elements' ) ) {
			throw Error( `storage with key: '${ storageKey }' does not have elements` );
		}
	}

	getHistory( args ) {
		// History is not required.
		return false;
	}

	apply( args ) {
		const { at, rebuild = false, storageKey = 'transfer', elements = [ args.element ] } = args,
			transferData = elementorCommon.storage.get( storageKey );

		// Paste on "Add Section" area.
		if ( rebuild ) {
			elements.forEach( ( currentElement ) => {
				const index = 'undefined' === typeof at ? currentElement.collection.length : at;

				if ( 'section' === transferData.elementsType ) {
					this.pasteTo( transferData, [ currentElement ], {
						at: index,
						edit: false,
					} );
				} else if ( 'column' === transferData.elementsType ) {
					const section = $e.run( 'document/elements/create', {
						element: currentElement,
						model: {
							elType: 'column',
						},
						options: {
							at: index,
							edit: false,
						},
						returnValue: true,
					} );

					this.pasteTo( transferData, [ section ] );

					section.resizeColumns();
				} else {
					// Next code changed from original since `_checkIsEmpty()` was removed.
					const section = $e.run( 'document/elements/createSection', {
						columns: 1,
						options: {
							at: index,
						},
						returnValue: true,
					} );

					this.pasteTo( transferData, [ section ] );
				}
			} );
		} else {
			this.pasteTo( transferData, elements );
		}
	}

	pasteTo( transferData, elements, options = {} ) {
		options = Object.assign( { at: null, clone: true }, options );

		transferData.elements.forEach( function( model ) {
			$e.run( 'document/elements/create', {
				elements,
				model,
				options,
			} );

			// On paste sections, increase the `at` for every section.
			if ( null !== options.at ) {
				options.at++;
			}
		} );
	}
}
