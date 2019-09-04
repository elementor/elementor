import Base from './base';

// Paste.
export default class extends Base {
	validateArgs( args ) {
		const { storageKey = 'transfer' } = args,
			transferData = elementorCommon.storage.get( storageKey );

		this.requireContainer( args );

		if ( ! transferData.hasOwnProperty( 'containers' ) ) {
			throw Error( `storage with key: '${ storageKey }' does not have containers` );
		}
	}

	getHistory( args ) {
		// History is not required.
		return false;
	}

	apply( args ) {
		const { at, rebuild = false, storageKey = 'transfer', containers = [ args.container ] } = args,
			transferData = elementorCommon.storage.get( storageKey ),
			result = [];

		// Paste on "Add Section" area.
		if ( rebuild ) {
			containers.forEach( ( currentContainer ) => {
				const index = 'undefined' === typeof at ? currentContainer.view.collection.length : at;

				if ( 'section' === transferData.elementsType ) {
					result.push( this.pasteTo( transferData, [ currentContainer ], {
						at: index,
						edit: false,
					} ) );
				} else if ( 'column' === transferData.elementsType ) {
					const section = $e.run( 'document/elements/create', {
						container: currentContainer,
						model: {
							elType: 'column',
						},
						options: {
							at: index,
							edit: false,
						},
						returnValue: true,
					} );

					result.push( this.pasteTo( transferData, [ section ] ) );

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

					result.push( this.pasteTo( transferData, [ section ] ) );
				}
			} );
		} else {
			result.push( this.pasteTo( transferData, containers ) );
		}

		if ( 1 === result.length ) {
			return result[ 0 ];
		}

		return result;
	}

	pasteTo( transferData, containers, options = {} ) {
		options = Object.assign( { at: null, clone: true }, options );

		const result = [];

		transferData.containers.forEach( function( model ) {
			result.push( $e.run( 'document/elements/create', {
				containers,
				model,
				options,
				returnValue: true,
			} ) );

			// On paste sections, increase the `at` for every section.
			if ( null !== options.at ) {
				options.at++;
			}
		} );

		if ( 1 === result.length ) {
			return result[ 0 ];
		}

		return result;
	}
}
