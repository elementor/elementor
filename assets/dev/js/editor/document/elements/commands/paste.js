export class Paste extends $e.modules.editor.document.CommandHistoryBase {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	getHistory() {
		return {
			type: 'paste',
			title: __( 'Elements', 'elementor' ),
		};
	}

	getStorageData( args ) {
		const { storageType = 'localstorage', storageKey = 'clipboard', data = '' } = args;

		if ( 'localstorage' === storageType ) {
			return elementorCommon.storage.get( storageKey ) || {};
		}

		try {
			return JSON.parse( data ) || {};
		} catch ( e ) {
			return {};
		}
	}

	async apply( args ) {
		const { at, rebuild = false, containers = [ args.container ], options = {} } = args,
			storageData = this.getStorageData( args );

		if ( ! storageData || ! storageData?.elements?.length || 'elementor' !== storageData?.type ) {
			return false;
		}

		let storageDataElements = storageData.elements;

		if ( storageData.siteurl !== elementorCommon.config.urls.rest ) {
			try {
				storageDataElements = await new Promise( ( resolve, reject ) => elementorCommon.ajax.addRequest( 'import_from_json', {
						data: {
							elements: JSON.stringify( storageDataElements ),
						},
						success: resolve,
						error: reject,
					},
				) );
			} catch ( e ) {
				return false;
			}
		}

		let result = [];

		// Paste on "Add Section" area.
		if ( rebuild ) {
			result = this.rebuild( containers, storageDataElements, at );
		} else {
			if ( undefined !== at ) {
				options.at = at;
			}

			result.push( this.pasteTo( containers, storageDataElements, options ) );
		}

		if ( 1 === result.length ) {
			return result[ 0 ];
		}

		return result;
	}

	rebuild( containers, data, at ) {
		// Paste at each target.
		const result = [];

		containers.forEach( ( targetContainer ) => {
			const createNewElementAtTheBottomOfThePage = 'undefined' === typeof at;
			let index = createNewElementAtTheBottomOfThePage ? targetContainer.view.collection.length : at;

			data.forEach( ( model ) => {
				switch ( model.elType ) {
					case 'container': {
						// Push the cloned container to the 'document'.
						result.push( this.pasteTo(
							[ targetContainer ],
							[ model ],
							{
								at: createNewElementAtTheBottomOfThePage ? ++index : index,
							} ),
						);
					}
						break;

					case 'section': {
						// If is inner create section for `inner-section`.
						if ( model.isInner ) {
							const section = $e.run( 'document/elements/create', {
								container: targetContainer,
								model: {
									elType: 'section',
								},
								columns: 1,
								options: {
									at: index,
									edit: false,
								},
							} );

							// `targetContainer` = first column at `section`.
							targetContainer = section.view.children.findByIndex( 0 ).getContainer();
						}

						// Will be not affected by hook since it always have `model.elements`.
						result.push( this.pasteTo(
							[ targetContainer ],
							[ model ],
							{
								at: index,
								edit: false,
							} ),
						);
						index++;
					}
						break;

					case 'column': {
						// Next code changed from original since `_checkIsEmpty()` was removed.
						const section = $e.run( 'document/elements/create', {
							container: targetContainer,
							model: {
								elType: 'section',
							},
							columns: 0, // Section with no columns.
							options: {
								at: ++index,
								edit: false,
							},
						} );

						result.push( this.pasteTo( [ section ], [ model ] ) );
					}
						break;

					default: {
						// The 'default' case is widget.
						let target;

						if ( 'section' === targetContainer.model.get( 'elType' ) ) {
							// On trying to paste widget on section, the paste should be at the first column.
							target = [ targetContainer.view.children.findByIndex( 0 ).getContainer() ];
						} else if ( 'container' === targetContainer.model.get( 'elType' ) ) {
							target = [ targetContainer ];
						} else if ( elementorCommon.config.experimentalFeatures.container ) {
							// If the container experiment is active, create a new wrapper container.
							target = $e.run( 'document/elements/create', {
								container: targetContainer,
								model: {
									elType: 'container',
								},
								options: {
									at: createNewElementAtTheBottomOfThePage ? ++index : index,
								},
							} );

							target = [ target ];
						} else {
							// Else, create section with one column for the element.
							const section = $e.run( 'document/elements/create', {
								container: targetContainer,
								model: {
									elType: 'section',
								},
								columns: 1,
								options: {
									at: createNewElementAtTheBottomOfThePage ? ++index : index,
								},
							} );

							// Create the element inside the column that just was created.
							target = [ section.view.children.first().getContainer() ];
						}

						result.push( this.pasteTo( target, [ model ] ) );
					}
				}
			} );
		} );

		return result;
	}

	pasteTo( targetContainers, models, options = {} ) {
		options = Object.assign( { at: null, clone: true }, options );

		const result = [];

		models.forEach( ( model ) => {
			result.push( $e.run( 'document/elements/create', {
				containers: targetContainers,
				model,
				options,
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

export default Paste;
