import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';
import * as commandsInternal from './commands-internal/';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'document/elements';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultCommandsInternal() {
		return this.importCommands( commandsInternal );
	}

	defaultStates() {
		const defaultReducers = {
			add: ( state, { payload } ) => {
				// Prepare
				const { containerId, models = [ payload.model ], index } = payload,
					parent = state[ containerId ];

				// Act
				for ( const model of models.slice() ) {
					// Store the newly created element, reset `elements` in order to make a flat list
					state[ model.id ] = { ...model, elements: [] };

					if ( model.elements?.length ) {
						// Add children elements
						defaultReducers.add( state, {
							payload: {
								containerId: model.id,
								models: model.elements,
							},
						} );
					}

					// Create reference on parent element. When the added container is the document (root), it has no
					// parent to create a reference on.
					if ( parent ) {
						parent.elements.splice( undefined !== index ? index : parent.elements.length, 0, model.id );
					}
				}
			},
			remove: ( state, { payload } ) => {
				// Prepare
				const { containerIds = [ payload.containerId ], parentId } = payload,
					parent = state[ parentId ];

				// Act
				for ( const containerId of containerIds ) {
					const container = state[ containerId ];

					if ( container && container.elements.length ) {
						// Remove children elements
						defaultReducers.remove( state, {
							payload: {
								containerIds: container.elements,
								parentId: containerId,
							},
						} );
					}

					// Remove current element
					delete state[ containerId ];

					// Remove reference from parent element
					if ( parent ) {
						parent.elements.splice( parent.elements.indexOf( containerId ), 1 );
					}
				}

				return state;
			},
			settings: ( state, { payload } ) => {
				// Prepare
				const { containerIds = [ payload.containerId ], settings } = payload;

				// Act
				for ( const containerId of containerIds ) {
					// Set settings of the current element
					if ( state[ containerId ] ) {
						state[ containerId ].settings = { ...state[ containerId ].settings, ...settings };
					}
				}
			},
			change: ( state, { payload } ) => {
				// Prepare
				const { containerIds = [ payload.containerId ], changes = {} } = payload;

				// Act
				for ( const containerId of containerIds ) {
					// Set settings of the current element
					state[ containerId ] = { ...state[ containerId ], ...changes };
				}
			},
			reset: ( state, { payload } ) => {
				// Act
				return {};
			},
		};

		return {
			'': {
				initialState: {},
				reducers: defaultReducers,
			},
			selection: {
				initialState: [],
				reducers: {
					toggle: ( state, { payload } ) => {
						// Prepare
						const { containerIds = [ payload.containerId ], state: selectionState, all = false } = payload;

						// Act
						for ( const containerId of ( all ? state : containerIds ) ) {
							// When no `selectionState` provided, it means toggle, in which case the new state should be
							// determined.
							const newState = undefined === selectionState ?
								state.indexOf( containerId ) < 1 :
								selectionState;

							if ( newState ) {
								state.push( containerId );
							} else {
								state.splice( state.indexOf( containerId ), 1 );
							}
						}
					},
					reset: ( state, { payload } ) => {
						// Act
						return [];
					},
				},
			},
		};
	}

	defaultUtils() {
		return {
			isValidChild: ( childModel, parentModel ) => {
				if ( childModel instanceof Backbone.Model ) {
					childModel = childModel.attributes;
				}
				if ( parentModel instanceof Backbone.Model ) {
					parentModel = parentModel.attributes;
				}

				const parentElType = parentModel.elType,
					draggedElType = childModel.elType,
					parentIsInner = parentModel.isInner,
					draggedIsInner = childModel.isInner;

				// Block's inner-section at inner-section column.
				if ( draggedIsInner && 'section' === draggedElType && parentIsInner && 'column' === parentElType ) {
					return false;
				}

				if ( draggedElType === parentElType ) {
					return false;
				}

				if ( 'section' === draggedElType && ! draggedIsInner && 'column' === parentElType ) {
					return false;
				}

				const childTypes = elementor.helpers.getElementChildType( parentElType );

				return childTypes && -1 !== childTypes.indexOf( draggedElType );
			},
			isValidGrandChild: ( childModel, targetContainer ) => {
				let result;

				const childElType = childModel.get( 'elType' );

				switch ( targetContainer.model.get( 'elType' ) ) {
					case 'document':
						result = true;
						break;

					case 'section':
						result = 'widget' === childElType;
						break;

					default:
						result = false;
				}

				return result;
			},
			isSameElement: ( sourceModel, targetContainer ) => {
				const targetElType = targetContainer.model.get( 'elType' ),
					sourceElType = sourceModel.get( 'elType' );

				if ( targetElType !== sourceElType ) {
					return false;
				}

				if ( 'column' === targetElType && 'column' === sourceElType ) {
					return true;
				}

				return targetContainer.model.get( 'isInner' ) === sourceModel.get( 'isInner' );
			},
			getPasteOptions: ( sourceModel, targetContainer ) => {
				const result = {};

				result.isValidChild = this.utils.isValidChild( sourceModel, targetContainer.model );
				result.isSameElement = this.utils.isSameElement( sourceModel, targetContainer );
				result.isValidGrandChild = this.utils.isValidGrandChild( sourceModel, targetContainer );

				return result;
			},
			isPasteEnabled: ( targetContainer ) => {
				const storage = elementorCommon.storage.get( 'clipboard' );

				// No storage? no paste.
				if ( ! storage || ! storage[ 0 ] ) {
					return false;
				}

				if ( ! ( storage[ 0 ] instanceof Backbone.Model ) ) {
					storage[ 0 ] = new Backbone.Model( storage[ 0 ] );
				}

				const pasteOptions = this.utils.getPasteOptions( storage[ 0 ], targetContainer );

				return Object.values( pasteOptions ).some(
					( opt ) => !! opt
				);
			},
		};
	}
}
