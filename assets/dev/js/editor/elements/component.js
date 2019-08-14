// TODO: Maybe it should merge with panel/elements?
export default class extends elementorModules.common.Component {
	getNamespace() {
		return 'elements';
	}

	defaultCommands() {
		return {
			create: ( args ) => {
				const options = args.options || {};
				const data = args.data || {};

				if ( ! args.element && ! args.elements ) {
					throw Error( 'element or elements are required.' );
				}

				if ( args.element && args.elements ) {
					throw Error( 'element and elements cannot go together please select one of them.' );
				}

				const elements = args.elements || [ args.element ];

				if ( ! options.hasOwnProperty( 'trigger' ) || true === options.trigger ) {
					options.trigger = {
						beforeAdd: 'element:before:add',
						afterAdd: 'element:after:add',
					};
				}

				let result = [];

				elements.forEach( ( element ) => {
					const createdElement = element.addChildElement( data, options );

					result.push( createdElement );

					if ( 'column' === createdElement.model.get( 'elType' ) ) {
						createdElement._parent.resetLayout();
					}
				} );

				if ( 1 === result.length ) {
					result = result[ 0 ];
				}

				return result;
			},
			createSection: ( args = {} ) => {
				const options = args.options || {};

				// To prevent useless triggers in column creation.
				options.edit = false;

				const elements = [];

				for ( let loopIndex = 0; loopIndex < args.columns; loopIndex++ ) {
					elements.push( {
						id: elementor.helpers.getUniqueID(),
						elType: 'column',
						settings: {},
						elements: [],
					} );
				}

				const section = elementor.getPreviewView().addChildElement( { elements }, options );

				if ( args.structure ) {
					section.setStructure( args.structure );
				}

				section.getEditModel().trigger( 'request:edit' );

				return section;
			},
			copy: ( args ) => {
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
			},
			copyAll: () => {
				$e.run( 'elements/copy', {
					elements: Object.values( elementor.getPreviewView().children._views ),
					elementsType: 'section',
				} );
			},
			duplicate: ( args ) => {
				// Todo: refactor with create/delete.

				if ( ! args.element ) {
					throw Error( 'element is required.' );
				}

				const keepPrevTransfer = elementorCommon.storage.get( 'transfer' ),
					target = args.target || args.element._parent;

				$e.run( 'elements/copy', { element: args.element } );
				$e.run( 'elements/paste', { element: target } );

				// Put back old transfer storage.
				elementorCommon.storage.set( 'transfer', keepPrevTransfer );
			},
			delete: ( args ) => {
				if ( ! args.element && ! args.elements ) {
					throw Error( 'element or elements are required.' );
				} else if ( args.element && args.elements ) {
					throw Error( 'element and elements cannot go together please select one of them.' );
				}

				const elements = args.elements || [ args.element ],
					options = args.options || {};

				options.trigger = ( ! options.hasOwnProperty( 'trigger' ) || true === options.trigger );

				elements.forEach( ( element ) => {
					if ( options.trigger ) {
						elementor.channels.data.trigger( 'element:before:remove', element.model );
					}

					const parent = element._parent;

					element.model.destroy();

					if ( 'section' === parent.model.get( 'elType' ) ) {
						if ( 0 === parent.collection.length && elementor.history.history.getActive() ) {
							this.handleEmptySection( parent );
						} else {
							parent.resetLayout();
						}
					}

					if ( options.trigger ) {
						elementor.channels.data.trigger( 'element:after:remove', element.model );
					}
				} );
			},
			empty: ( args = {} ) => {
				if ( args.force ) {
					elementor.elements.reset();
					return;
				}

				elementor.getClearPageDialog().show();
			},
			move: ( args ) => {
				if ( ! args.target ) {
					throw Error( 'target is required.' );
				}

				if ( ! args.element && ! args.elements ) {
					throw Error( 'element or elements are required.' );
				}

				if ( args.element && args.elements ) {
					throw Error( 'element and elements cannot go together please select one of them.' );
				}

				const options = args.options || {},
					elements = args.element ? [ args.element ] : args.elements;

				elementor.channels.data.trigger( 'drag:before:update', elements[ 0 ].model );

				elements.forEach( ( element ) => {
					const data = element.model.clone();

					$e.run( 'elements/create', {
						element: args.target,
						data,
						options,
						returnValue: true,
					} );
				} );

				// For multi selection.
				if ( ! options.onBeforeAdd && ! options.onAfterAdd ) {
					elements.forEach( ( element ) => {
						element._isRendering = true;

						$e.run( 'elements/delete', { element } );
					} );
				}

				elementor.channels.data.trigger( 'drag:after:update' );
			},
			paste: ( args ) => {
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

				const pasteTo = ( elements, options = {} ) => {
					options = Object.assign( { at: null, clone: true }, options );

					transferData.elements.forEach( function( data ) {
						$e.run( 'elements/create', {
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
							const section = $e.run( 'elements/create', {
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
							const section = $e.run( 'elements/createSection', {
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
			},
			pasteStyle: ( args ) => {
				if ( ! args.element && ! args.elements ) {
					throw Error( 'element or elements are required.' );
				}

				if ( args.element && args.elements ) {
					throw Error( 'element and elements cannot go together please select one of them.' );
				}

				if ( args.element ) {
					args.elements = [ args.element ];
				}

				const transferData = elementorCommon.storage.get( 'transfer' ),
					sourceElement = transferData.elements[ 0 ],
					sourceSettings = sourceElement.settings;

				args.elements.forEach( ( element ) => {
					const targetEditModel = element.getEditModel(),
						targetSettings = targetEditModel.get( 'settings' ),
						targetSettingsAttributes = targetSettings.attributes,
						targetControls = targetSettings.controls,
						diffSettings = {};

					jQuery.each( targetControls, ( controlName, control ) => {
						if ( ! element.isStyleTransferControl( control ) ) {
							return;
						}

						const controlSourceValue = sourceSettings[ controlName ],
							controlTargetValue = targetSettingsAttributes[ controlName ];

						if ( undefined === controlSourceValue || undefined === controlTargetValue ) {
							return;
						}

						if ( 'object' === typeof controlSourceValue ^ 'object' === typeof controlTargetValue ) {
							return;
						}

						if ( 'object' === typeof controlSourceValue ) {
							let isEqual = true;

							jQuery.each( controlSourceValue, function( propertyKey ) {
								if ( controlSourceValue[ propertyKey ] !== controlTargetValue[ propertyKey ] ) {
									return isEqual = false;
								}
							} );

							if ( isEqual ) {
								return;
							}
						}
						if ( controlSourceValue === controlTargetValue ) {
							return;
						}

						const ControlView = elementor.getControlView( control.type );

						if ( ! ControlView.onPasteStyle( control, controlSourceValue ) ) {
							return;
						}

						diffSettings[ controlName ] = controlSourceValue;
					} );

					element.allowRender = false;

					elementor.channels.data.trigger( 'element:before:paste:style', targetEditModel );

					targetEditModel.setSetting( diffSettings );

					elementor.channels.data.trigger( 'element:after:paste:style', targetEditModel );

					element.allowRender = true;

					element.renderOnChange();
				} );
			},
			resetStyle: ( args ) => {
				if ( ! args.element && ! args.elements ) {
					throw Error( 'element or elements are required.' );
				}

				if ( args.element && args.elements ) {
					throw Error( 'element and elements cannot go together please select one of them.' );
				}

				if ( args.element ) {
					args.elements = [ args.element ];
				}

				args.elements.forEach( ( element ) => {
					const editModel = element.getEditModel(),
						controls = editModel.get( 'settings' ).controls,
						defaultValues = {};

					element.allowRender = false;

					jQuery.each( controls, ( controlName, control ) => {
						if ( ! element.isStyleTransferControl( control ) ) {
							return;
						}

						defaultValues[ controlName ] = control.default;
					} );

					editModel.setSetting( defaultValues );

					elementor.channels.data.trigger( 'element:after:reset:style', editModel );

					element.allowRender = true;

					element.renderOnChange();
				} );
			},
			settings: ( args ) => {
				if ( ! args.settings ) {
					throw Error( 'settings are required.' );
				}

				if ( ! args.element && ! args.elements ) {
					throw Error( 'element or elements is required.' );
				}

				if ( args.element && args.elements ) {
					throw Error( 'element and elements cannot go together please select one of them.' );
				}

				const settings = args.settings,
					options = args.options || {};

				if ( args.element ) {
					args.elements = [ args.element ];
				}

				args.elements.forEach( ( element ) => {
					const settingsModel = element.getEditModel().get( 'settings' );

					if ( options.external ) {
						settingsModel.setExternalChange( settings );
					} else {
						settingsModel.set( settings );
					}
				} );
			},
		};
	}

	defaultShortcuts() {
		return {
			copy: {
				keys: 'ctrl+c',
				exclude: [ 'input' ],
			},
			duplicate: {
				keys: 'ctrl+d',
			},
			delete: {
				keys: 'del',
				exclude: [ 'input' ],
			},
			paste: {
				keys: 'ctrl+v',
				exclude: [ 'input' ],
				dependency: () => {
					return elementor.getCurrentElement().isPasteEnabled();
				},
			},
			pasteStyle: {
				keys: 'ctrl+shift+v',
				exclude: [ 'input' ],
				dependency: () => {
					return elementor.getCurrentElement().pasteStyle && elementorCommon.storage.get( 'transfer' );
				},
			},
		};
	}

	handleEmptySection( section ) {
		$e.run( 'elements/create', { element: section } );
	}
}
