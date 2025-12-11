import { jest } from '@jest/globals';

const ELEMENT_ID = 'test-element-123';
const BASE_ATTRIBUTES = {
	'data-id': 'abc-123',
	'data-element_type': 'e-div-block',
	'data-model-cid': 'c456',
};
const INITIAL_ATTRIBUTES = {
	'data-special-flag': 'true',
};
const CSS_ID_VALUE = 'custom-id';
const HREF_VALUE = '/test-link';

describe( 'createAtomicElementBaseView - renderOnChange', () => {
	let AtomicElementView;
	let viewInstance;
	let mockModel;
	let mockElement;
	let mockJQueryElement;
	let BaseElementView;

	beforeAll( async () => {
		global.Marionette = {
			ItemView: class {},
			CompositeView: {
				prototype: {
					getChildViewContainer: jest.fn(),
				},
			},
			TemplateCache: {
				get: jest.fn( () => '<div></div>' ),
			},
		};

		global.jQuery = jest.fn( ( selector ) => {
			if ( '<div>' === selector ) {
				return {
					class: '',
					'data-side': '',
				};
			}
			return mockJQueryElement;
		} );

		global.elementorCommon = {
			config: {
				isRTL: false,
			},
		};

		BaseElementView = class {
			constructor() {
				this.model = mockModel;
				this.el = mockElement;
				this.$el = mockJQueryElement;
			}

			static extend( props ) {
				const Extended = class extends this {};
				Object.assign( Extended.prototype, props );
				return Extended;
			}
		};

		BaseElementView.prototype.attributes = jest.fn( () => ( { ...BASE_ATTRIBUTES } ) );
		BaseElementView.prototype.className = jest.fn( () => 'base-element-class' );
		BaseElementView.prototype.renderOnChange = jest.fn();
		BaseElementView.prototype.behaviors = jest.fn( () => ( {} ) );
		BaseElementView.prototype.ui = jest.fn( () => ( {} ) );

		global.elementor = {
			modules: {
				elements: {
					views: {
						BaseElement: BaseElementView,
					},
				},
			},
			config: {
				elements: {},
			},
			helpers: {
				getAtomicWidgetBaseStyles: jest.fn( () => ( {} ) ),
			},
		};

		const createAtomicElementBaseView = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/create-atomic-element-base-view' ) ).default;
		AtomicElementView = createAtomicElementBaseView( 'e-div-block' );
	} );

	beforeEach( () => {
		const mockAttributes = {
			'data-id': BASE_ATTRIBUTES[ 'data-id' ],
			'data-element_type': BASE_ATTRIBUTES[ 'data-element_type' ],
			'data-model-cid': BASE_ATTRIBUTES[ 'data-model-cid' ],
			'data-special-flag': INITIAL_ATTRIBUTES[ 'data-special-flag' ],
			'data-interaction-id': ELEMENT_ID,
			class: 'e-con e-atomic-element base-element-class',
			id: CSS_ID_VALUE,
			href: HREF_VALUE,
		};

		mockElement = {
			tagName: 'DIV',
			attributes: Object.keys( mockAttributes ).map( ( name ) => ( { name, value: mockAttributes[ name ] } ) ),
			getBoundingClientRect: jest.fn( () => ( { width: 100 } ) ),
		};

		const removedAttrs = [];

		mockJQueryElement = {
			0: mockElement,
			removeAttr: jest.fn( ( attrName ) => {
				removedAttrs.push( attrName );
				mockElement.attributes = mockElement.attributes.filter( ( attr ) => attr.name !== attrName );
			} ),
			attr: jest.fn( ( key, value ) => {
				if ( value !== undefined ) {
					const existingAttr = mockElement.attributes.find( ( attr ) => attr.name === key );
					if ( existingAttr ) {
						existingAttr.value = value;
					} else {
						mockElement.attributes.push( { name: key, value } );
					}
				}
			} ),
			addClass: jest.fn(),
			find: jest.fn( () => ( { length: 0 } ) ),
			children: jest.fn( () => ( {
				append: jest.fn(),
			} ) ),
			parent: jest.fn( () => ( {
				width: jest.fn( () => 1000 ),
			} ) ),
		};

		mockModel = {
			get: jest.fn( ( key ) => {
				if ( 'id' === key ) {
					return ELEMENT_ID;
				}
				return undefined;
			} ),
			getSetting: jest.fn( ( key ) => {
				if ( 'attributes' === key ) {
					return {
						value: [
							{
								value: {
									key: { value: 'data-custom' },
									value: { value: 'my-value' },
								},
							},
						],
					};
				}
				if ( '_cssid' === key ) {
					return { value: CSS_ID_VALUE };
				}
				if ( 'link' === key ) {
					return {
						value: {
							destination: {
								$$type: 'string',
								value: HREF_VALUE,
							},
						},
					};
				}
				if ( 'classes' === key ) {
					return { value: [] };
				}
				return undefined;
			} ),
			config: {
				initial_attributes: { ...INITIAL_ATTRIBUTES },
			},
		};

		viewInstance = new AtomicElementView();
		viewInstance.model = mockModel;
		viewInstance.el = mockElement;
		viewInstance.$el = mockJQueryElement;
		viewInstance._parent = null;
		viewInstance.container = {
			parent: { id: 'document' },
		};
		viewInstance.options = { model: mockModel };

		jest.clearAllMocks();
	} );

	afterAll( () => {
		delete global.Marionette;
		delete global.jQuery;
		delete global.elementorCommon;
		delete global.elementor;
	} );

	it( 'should preserve all attributes when custom attributes change', () => {
		// Arrange
		const settings = {
			changedAttributes: jest.fn( () => ( {
				attributes: true,
			} ) ),
		};

		// Act
		viewInstance.renderOnChange( settings );

		// Assert
		const currentAttributes = mockElement.attributes.map( ( attr ) => attr.name );

		expect( currentAttributes ).toContain( 'data-id' );
		expect( currentAttributes ).toContain( 'data-element_type' );
		expect( currentAttributes ).toContain( 'data-model-cid' );
		expect( currentAttributes ).toContain( 'data-special-flag' );
		expect( currentAttributes ).toContain( 'data-interaction-id' );
		expect( currentAttributes ).toContain( 'id' );
		expect( currentAttributes ).toContain( 'href' );
		expect( currentAttributes ).toContain( 'data-custom' );
	} );

	it( 'should call attributes() to get complete attribute set when attributes change', () => {
		// Arrange
		const settings = {
			changedAttributes: jest.fn( () => ( {
				attributes: true,
			} ) ),
		};

		const attributesSpy = jest.spyOn( viewInstance, 'attributes' );

		// Act
		viewInstance.renderOnChange( settings );

		// Assert
		expect( attributesSpy ).toHaveBeenCalled();
	} );

	it( 'should not remove class attribute when custom attributes change', () => {
		// Arrange
		const settings = {
			changedAttributes: jest.fn( () => ( {
				attributes: true,
			} ) ),
		};

		// Act
		viewInstance.renderOnChange( settings );

		// Assert
		const currentAttributes = mockElement.attributes.map( ( attr ) => attr.name );
		expect( currentAttributes ).toContain( 'class' );
	} );

	it( 'should remove old attributes except class before applying new ones', () => {
		// Arrange
		mockElement.attributes.push( { name: 'data-old-attribute', value: 'should-be-removed' } );

		const settings = {
			changedAttributes: jest.fn( () => ( {
				attributes: true,
			} ) ),
		};

		// Act
		viewInstance.renderOnChange( settings );

		// Assert
		const currentAttributes = mockElement.attributes.map( ( attr ) => attr.name );
		expect( currentAttributes ).not.toContain( 'data-old-attribute' );
	} );

	it( 'should include data-interaction-id from attributes() method', () => {
		// Arrange
		const settings = {
			changedAttributes: jest.fn( () => ( {
				attributes: true,
			} ) ),
		};

		// Act
		viewInstance.renderOnChange( settings );

		// Assert
		const interactionIdAttr = mockElement.attributes.find( ( attr ) => 'data-interaction-id' === attr.name );
		expect( interactionIdAttr ).toBeDefined();
		expect( interactionIdAttr.value ).toBe( ELEMENT_ID );
	} );

	it( 'should include initial_attributes from model config', () => {
		// Arrange
		const settings = {
			changedAttributes: jest.fn( () => ( {
				attributes: true,
			} ) ),
		};

		// Act
		viewInstance.renderOnChange( settings );

		// Assert
		const specialFlagAttr = mockElement.attributes.find( ( attr ) => 'data-special-flag' === attr.name );
		expect( specialFlagAttr ).toBeDefined();
		expect( specialFlagAttr.value ).toBe( 'true' );
	} );

	it( 'should include base attributes from BaseElementView', () => {
		// Arrange
		const settings = {
			changedAttributes: jest.fn( () => ( {
				attributes: true,
			} ) ),
		};

		// Act
		viewInstance.renderOnChange( settings );

		// Assert
		const currentAttributes = mockElement.attributes.map( ( attr ) => attr.name );
		expect( currentAttributes ).toContain( 'data-id' );
		expect( currentAttributes ).toContain( 'data-element_type' );
		expect( currentAttributes ).toContain( 'data-model-cid' );
	} );
} );

