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
const DEFAULT_HTML_TAG = 'div';
const OVERRIDE_KEY = 'prop-123-abc';
const OVERRIDDEN_TAG = 'section';
const ORIGIN_TAG = 'header';
const DYNAMIC_LINK_VALUE = '#elementor-action%3Aaction%3Dpopup';

const createOverridableProp = ( originValue, overrideKey = OVERRIDE_KEY ) => ( {
	$$type: 'overridable',
	value: {
		override_key: overrideKey,
		origin_value: {
			$$type: 'string',
			value: originValue,
		},
	},
} );

const createLinkProp = ( destination ) => ( {
	$$type: 'link',
	value: {
		destination,
	},
} );

const createOverridableLinkProp = ( destination, overrideKey = OVERRIDE_KEY ) => ( {
	$$type: 'overridable',
	value: {
		override_key: overrideKey,
		origin_value: createLinkProp( destination ),
	},
} );

const createDynamicDestination = ( name, group, settings = {} ) => ( {
	$$type: 'dynamic',
	value: {
		name,
		group,
		settings: {
			group,
			...settings,
		},
	},
} );

const createUrlDestination = ( url ) => ( {
	$$type: 'url',
	value: url,
} );

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
						$$type: 'link',
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

describe( 'createAtomicElementBaseView - tagName with overridable props', () => {
	let AtomicElementView;
	let viewInstance;
	let mockModel;
	let mockTransformer;

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

		global.jQuery = jest.fn( () => ( {
			children: jest.fn( () => ( { append: jest.fn() } ) ),
		} ) );

		global.elementorCommon = {
			config: { isRTL: false },
		};

		const BaseElementView = class {
			static extend( props ) {
				const Extended = class extends this {};
				Object.assign( Extended.prototype, props );
				return Extended;
			}
		};

		BaseElementView.prototype.attributes = jest.fn( () => ( {} ) );
		BaseElementView.prototype.className = jest.fn( () => '' );
		BaseElementView.prototype.renderOnChange = jest.fn();
		BaseElementView.prototype.behaviors = jest.fn( () => ( {} ) );
		BaseElementView.prototype.ui = jest.fn( () => ( {} ) );

		global.elementor = {
			modules: {
				elements: {
					views: { BaseElement: BaseElementView },
				},
			},
			config: { elements: {} },
			helpers: { getAtomicWidgetBaseStyles: jest.fn( () => ( {} ) ) },
		};

		const createAtomicElementBaseView = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/create-atomic-element-base-view' ) ).default;
		AtomicElementView = createAtomicElementBaseView( 'e-div-block' );
	} );

	beforeEach( () => {
		mockTransformer = jest.fn( ( propValue, { renderContext } ) => {
			const overrideKey = propValue.override_key;
			const override = renderContext?.overrides?.[ overrideKey ];

			return override ?? propValue.origin_value;
		} );

		global.window = global.window || {};
		global.window.elementorV2 = {
			editorCanvas: {
				settingsTransformersRegistry: {
					get: jest.fn( () => mockTransformer ),
				},
			},
		};

		mockModel = {
			get: jest.fn( ( key ) => {
				if ( 'id' === key ) {
					return ELEMENT_ID;
				}
				return undefined;
			} ),
			set: jest.fn(),
			unset: jest.fn(),
			getSetting: jest.fn( () => undefined ),
			config: {
				default_html_tag: DEFAULT_HTML_TAG,
			},
		};

		viewInstance = new AtomicElementView();
		viewInstance.model = mockModel;
		viewInstance._parent = null;

		jest.clearAllMocks();
	} );

	afterAll( () => {
		delete global.Marionette;
		delete global.jQuery;
		delete global.elementorCommon;
		delete global.elementor;
		if ( global.window ) {
			delete global.window.elementorV2;
		}
	} );

	it( 'should return cached tag when available', () => {
		// Arrange
		viewInstance._cacheResolvedTag( 'article' );

		// Act
		const result = viewInstance.tagName();

		// Assert
		expect( result ).toBe( 'article' );
	} );

	it( 'should return default tag when no tag setting exists', () => {
		// Arrange
		mockModel.getSetting.mockReturnValue( undefined );

		// Act
		const result = viewInstance.tagName();

		// Assert
		expect( result ).toBe( DEFAULT_HTML_TAG );
	} );

	it( 'should extract value from simple prop type object', () => {
		// Arrange
		mockModel.getSetting.mockImplementation( ( key ) => {
			if ( 'tag' === key ) {
				return { $$type: 'string', value: 'section' };
			}
			return undefined;
		} );

		// Act
		const result = viewInstance.tagName();

		// Assert
		expect( result ).toBe( 'section' );
	} );

	it( 'should resolve overridable prop to origin value when no render context', () => {
		// Arrange
		mockModel.getSetting.mockImplementation( ( key ) => {
			if ( 'tag' === key ) {
				return createOverridableProp( ORIGIN_TAG );
			}
			return undefined;
		} );

		// Act
		const result = viewInstance.tagName();

		// Assert
		expect( result ).toBe( ORIGIN_TAG );
	} );

	it( 'should resolve overridable prop to override value when render context has matching override', () => {
		// Arrange
		mockModel.getSetting.mockImplementation( ( key ) => {
			if ( 'tag' === key ) {
				return createOverridableProp( ORIGIN_TAG );
			}
			return undefined;
		} );

		viewInstance.getResolverRenderContext = jest.fn( () => ( {
			overrides: {
				[ OVERRIDE_KEY ]: { $$type: 'string', value: OVERRIDDEN_TAG },
			},
		} ) );

		// Act
		const result = viewInstance.tagName();

		// Assert
		expect( result ).toBe( OVERRIDDEN_TAG );
		expect( mockTransformer ).toHaveBeenCalled();
	} );

	it( 'should return "a" tag when element has link', () => {
		// Arrange
		mockModel.getSetting.mockImplementation( ( key ) => {
			if ( 'tag' === key ) {
				return { $$type: 'string', value: 'div' };
			}
			if ( 'link' === key ) {
				return createLinkProp( createUrlDestination( 'https://example.com' ) );
			}
			return undefined;
		} );

		// Act
		const result = viewInstance.tagName();

		// Assert
		expect( result ).toBe( 'a' );
	} );
} );

describe( 'createAtomicElementBaseView - getLink with overridable props', () => {
	let AtomicElementView;
	let viewInstance;
	let mockModel;
	let mockTransformer;

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

		global.jQuery = jest.fn( () => ( {
			children: jest.fn( () => ( { append: jest.fn() } ) ),
		} ) );

		global.elementorCommon = {
			config: { isRTL: false },
		};

		const BaseElementView = class {
			static extend( props ) {
				const Extended = class extends this {};
				Object.assign( Extended.prototype, props );
				return Extended;
			}
		};

		BaseElementView.prototype.attributes = jest.fn( () => ( {} ) );
		BaseElementView.prototype.className = jest.fn( () => '' );
		BaseElementView.prototype.renderOnChange = jest.fn();
		BaseElementView.prototype.behaviors = jest.fn( () => ( {} ) );
		BaseElementView.prototype.ui = jest.fn( () => ( {} ) );

		global.elementor = {
			modules: {
				elements: {
					views: { BaseElement: BaseElementView },
				},
			},
			config: {
				elements: {},
				home_url: 'https://example.com',
			},
			helpers: { getAtomicWidgetBaseStyles: jest.fn( () => ( {} ) ) },
		};

		const createAtomicElementBaseView = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/create-atomic-element-base-view' ) ).default;
		AtomicElementView = createAtomicElementBaseView( 'e-div-block' );
	} );

	beforeEach( () => {
		mockTransformer = jest.fn( ( propValue, { renderContext } ) => {
			const overrideKey = propValue.override_key;
			const override = renderContext?.overrides?.[ overrideKey ];

			return override ?? propValue.origin_value;
		} );

		global.window = global.window || {};
		global.window.elementorV2 = {
			editorCanvas: {
				settingsTransformersRegistry: {
					get: jest.fn( () => mockTransformer ),
				},
			},
		};

		mockModel = {
			get: jest.fn( () => undefined ),
			set: jest.fn(),
			unset: jest.fn(),
			getSetting: jest.fn( () => undefined ),
			config: { default_html_tag: DEFAULT_HTML_TAG },
		};

		viewInstance = new AtomicElementView();
		viewInstance.model = mockModel;
		viewInstance._parent = null;
		viewInstance.handleDynamicLink = jest.fn( ( value ) => {
			if ( 'popup' === value.name ) {
				return DYNAMIC_LINK_VALUE;
			}
			return null;
		} );

		jest.clearAllMocks();
	} );

	afterAll( () => {
		delete global.Marionette;
		delete global.jQuery;
		delete global.elementorCommon;
		delete global.elementor;
		if ( global.window ) {
			delete global.window.elementorV2;
		}
	} );

	it( 'should return null when no link setting exists', () => {
		// Arrange
		mockModel.getSetting.mockReturnValue( undefined );

		// Act
		const result = viewInstance.getLink();

		// Assert
		expect( result ).toBeNull();
	} );

	it( 'should return href attribute for URL destination', () => {
		// Arrange
		mockModel.getSetting.mockImplementation( ( key ) => {
			if ( 'link' === key ) {
				return createLinkProp( createUrlDestination( 'https://example.com' ) );
			}
			return undefined;
		} );

		// Act
		const result = viewInstance.getLink();

		// Assert
		expect( result ).toEqual( {
			attr: 'href',
			value: 'https://example.com',
		} );
	} );

	it( 'should return href with home_url prefix for number destination', () => {
		// Arrange
		mockModel.getSetting.mockImplementation( ( key ) => {
			if ( 'link' === key ) {
				return createLinkProp( { $$type: 'number', value: 123 } );
			}
			return undefined;
		} );

		// Act
		const result = viewInstance.getLink();

		// Assert
		expect( result ).toEqual( {
			attr: 'href',
			value: 'https://example.com/?p=123',
		} );
	} );

	it( 'should return data-action-link for dynamic action destination', () => {
		// Arrange
		mockModel.getSetting.mockImplementation( ( key ) => {
			if ( 'link' === key ) {
				return createLinkProp( createDynamicDestination( 'popup', 'action', { action: 'open' } ) );
			}
			return undefined;
		} );

		// Act
		const result = viewInstance.getLink();

		// Assert
		expect( result ).toEqual( {
			attr: 'data-action-link',
			value: DYNAMIC_LINK_VALUE,
		} );
	} );

	it( 'should return href for dynamic non-action destination', () => {
		// Arrange
		viewInstance.handleDynamicLink = jest.fn( () => 'https://dynamic-url.com' );

		mockModel.getSetting.mockImplementation( ( key ) => {
			if ( 'link' === key ) {
				return createLinkProp( createDynamicDestination( 'post-url', 'post' ) );
			}
			return undefined;
		} );

		// Act
		const result = viewInstance.getLink();

		// Assert
		expect( result ).toEqual( {
			attr: 'href',
			value: 'https://dynamic-url.com',
		} );
	} );

	it( 'should resolve overridable link to origin value when no render context', () => {
		// Arrange
		const originUrl = 'https://origin.com';

		mockModel.getSetting.mockImplementation( ( key ) => {
			if ( 'link' === key ) {
				return createOverridableLinkProp( createUrlDestination( originUrl ) );
			}
			return undefined;
		} );

		// Act
		const result = viewInstance.getLink();

		// Assert
		expect( result ).toEqual( {
			attr: 'href',
			value: originUrl,
		} );
	} );

	it( 'should resolve overridable link to override value when render context has matching override', () => {
		// Arrange
		const originUrl = 'https://origin.com';
		const overrideUrl = 'https://override.com';

		mockModel.getSetting.mockImplementation( ( key ) => {
			if ( 'link' === key ) {
				return createOverridableLinkProp( createUrlDestination( originUrl ) );
			}
			return undefined;
		} );

		viewInstance.getResolverRenderContext = jest.fn( () => ( {
			overrides: {
				[ OVERRIDE_KEY ]: createLinkProp( createUrlDestination( overrideUrl ) ),
			},
		} ) );

		// Act
		const result = viewInstance.getLink();

		// Assert
		expect( result ).toEqual( {
			attr: 'href',
			value: overrideUrl,
		} );
	} );
} );

describe( 'createAtomicElementBaseView - _resolvePropValue', () => {
	let AtomicElementView;
	let viewInstance;
	let mockTransformer;

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

		global.jQuery = jest.fn( () => ( {
			children: jest.fn( () => ( { append: jest.fn() } ) ),
		} ) );

		global.elementorCommon = {
			config: { isRTL: false },
		};

		const BaseElementView = class {
			static extend( props ) {
				const Extended = class extends this {};
				Object.assign( Extended.prototype, props );
				return Extended;
			}
		};

		BaseElementView.prototype.attributes = jest.fn( () => ( {} ) );
		BaseElementView.prototype.className = jest.fn( () => '' );
		BaseElementView.prototype.renderOnChange = jest.fn();
		BaseElementView.prototype.behaviors = jest.fn( () => ( {} ) );
		BaseElementView.prototype.ui = jest.fn( () => ( {} ) );

		global.elementor = {
			modules: {
				elements: {
					views: { BaseElement: BaseElementView },
				},
			},
			config: { elements: {} },
			helpers: { getAtomicWidgetBaseStyles: jest.fn( () => ( {} ) ) },
		};

		const createAtomicElementBaseView = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/create-atomic-element-base-view' ) ).default;
		AtomicElementView = createAtomicElementBaseView( 'e-div-block' );
	} );

	beforeEach( () => {
		mockTransformer = jest.fn( ( propValue, { renderContext } ) => {
			const overrideKey = propValue.override_key;
			const override = renderContext?.overrides?.[ overrideKey ];

			return override ?? propValue.origin_value;
		} );

		global.window = global.window || {};
		global.window.elementorV2 = {
			editorCanvas: {
				settingsTransformersRegistry: {
					get: jest.fn( () => mockTransformer ),
				},
			},
		};

		viewInstance = new AtomicElementView();

		jest.clearAllMocks();
	} );

	afterAll( () => {
		delete global.Marionette;
		delete global.jQuery;
		delete global.elementorCommon;
		delete global.elementor;
		if ( global.window ) {
			delete global.window.elementorV2;
		}
	} );

	it( 'should return primitive values as-is', () => {
		// Arrange & Act & Assert
		expect( viewInstance._resolvePropValue( null ) ).toBeNull();
		expect( viewInstance._resolvePropValue( undefined ) ).toBeUndefined();
		expect( viewInstance._resolvePropValue( 'string' ) ).toBe( 'string' );
		expect( viewInstance._resolvePropValue( 123 ) ).toBe( 123 );
	} );

	it( 'should return non-overridable objects as-is', () => {
		// Arrange
		const prop = { $$type: 'string', value: 'test' };

		// Act
		const result = viewInstance._resolvePropValue( prop );

		// Assert
		expect( result ).toEqual( prop );
	} );

	it( 'should fall back to origin_value when transformer is not available', () => {
		// Arrange
		global.window.elementorV2.editorCanvas.settingsTransformersRegistry.get = jest.fn( () => undefined );

		const prop = createOverridableProp( 'origin-value' );

		// Act
		const result = viewInstance._resolvePropValue( prop );

		// Assert
		expect( result ).toEqual( { $$type: 'string', value: 'origin-value' } );
	} );

	it( 'should use transformer when available', () => {
		// Arrange
		const prop = createOverridableProp( ORIGIN_TAG );
		const renderContext = {
			overrides: {
				[ OVERRIDE_KEY ]: { $$type: 'string', value: OVERRIDDEN_TAG },
			},
		};

		// Act
		const result = viewInstance._resolvePropValue( prop, renderContext );

		// Assert
		expect( mockTransformer ).toHaveBeenCalledWith(
			prop.value,
			{ key: 'overridable', renderContext },
		);
		expect( result ).toEqual( { $$type: 'string', value: OVERRIDDEN_TAG } );
	} );

	it( 'should recursively resolve nested overridable props', () => {
		// Arrange
		const nestedOverrideKey = 'nested-prop-456';
		const innerProp = createOverridableProp( 'inner-origin', nestedOverrideKey );

		mockTransformer.mockImplementation( ( propValue, { renderContext } ) => {
			const overrideKey = propValue.override_key;
			const override = renderContext?.overrides?.[ overrideKey ];

			if ( override ) {
				return override;
			}

			return propValue.origin_value;
		} );

		const renderContext = {
			overrides: {
				[ nestedOverrideKey ]: { $$type: 'string', value: 'nested-override' },
			},
		};

		// Act
		const result = viewInstance._resolvePropValue( innerProp, renderContext );

		// Assert
		expect( result ).toEqual( { $$type: 'string', value: 'nested-override' } );
	} );
} );

describe( 'createAtomicElementBaseView - cache invalidation', () => {
	let AtomicElementView;
	let viewInstance;
	let mockModel;

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

		global.jQuery = jest.fn( () => ( {
			children: jest.fn( () => ( { append: jest.fn() } ) ),
		} ) );

		global.elementorCommon = {
			config: { isRTL: false },
		};

		const BaseElementView = class {
			static extend( props ) {
				const Extended = class extends this {};
				Object.assign( Extended.prototype, props );
				return Extended;
			}
		};

		BaseElementView.prototype.attributes = jest.fn( () => ( {} ) );
		BaseElementView.prototype.className = jest.fn( () => '' );
		BaseElementView.prototype.renderOnChange = jest.fn();
		BaseElementView.prototype.behaviors = jest.fn( () => ( {} ) );
		BaseElementView.prototype.ui = jest.fn( () => ( {} ) );

		global.elementor = {
			modules: {
				elements: {
					views: { BaseElement: BaseElementView },
				},
			},
			config: { elements: {} },
			helpers: { getAtomicWidgetBaseStyles: jest.fn( () => ( {} ) ) },
		};

		const createAtomicElementBaseView = ( await import( 'elementor/modules/atomic-widgets/assets/js/editor/create-atomic-element-base-view' ) ).default;
		AtomicElementView = createAtomicElementBaseView( 'e-div-block' );
	} );

	beforeEach( () => {
		mockModel = {
			get: jest.fn( () => undefined ),
			set: jest.fn(),
			unset: jest.fn(),
			getSetting: jest.fn( () => undefined ),
			config: { default_html_tag: DEFAULT_HTML_TAG },
		};

		viewInstance = new AtomicElementView();
		viewInstance.model = mockModel;
		viewInstance.triggerMethod = jest.fn();

		jest.clearAllMocks();
	} );

	afterAll( () => {
		delete global.Marionette;
		delete global.jQuery;
		delete global.elementorCommon;
		delete global.elementor;
	} );

	it( 'should clear tag cache in _beforeRender', () => {
		// Arrange
		viewInstance._cacheResolvedTag( 'cached-tag' );

		// Act
		viewInstance._beforeRender();

		// Assert - cache should be invalidated, so tagName should resolve fresh
		expect( viewInstance.tagName() ).toBe( DEFAULT_HTML_TAG );
	} );

	it( 'should set _isRendering to true in _beforeRender', () => {
		// Arrange & Act
		viewInstance._beforeRender();

		// Assert
		expect( viewInstance._isRendering ).toBe( true );
	} );

	it( 'should trigger before:render method in _beforeRender', () => {
		// Arrange & Act
		viewInstance._beforeRender();

		// Assert
		expect( viewInstance.triggerMethod ).toHaveBeenCalledWith( 'before:render', viewInstance );
	} );
} );
