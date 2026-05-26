import { type V1ElementConfig } from '@elementor/editor-elements';

import { adaptLeafRootParams, type BuildCompositionParams, DIV_BLOCK_TAG, ZERO_SPACING } from '../xml-leaf-wrapper';

const LEAF_WIDGET_TAG = 'e-heading';
const CONTAINER_TAG = 'e-div-block';
const DIV_BLOCK_TITLE = 'Div Block';

const makeWidgetsCache = (
	overrides: Record< string, Partial< V1ElementConfig > > = {}
): Record< string, V1ElementConfig > =>
	( {
		[ LEAF_WIDGET_TAG ]: { title: 'Heading', controls: {}, elType: 'widget' },
		[ CONTAINER_TAG ]: { title: DIV_BLOCK_TITLE, controls: {}, elType: 'e-div-block' },
		...overrides,
	} ) as Record< string, V1ElementConfig >;

const parseXml = ( xml: string ) => new DOMParser().parseFromString( xml, 'application/xml' );

const expectElementAttribute = ( element: Element, attribute: string, value: string ) => {
	// eslint-disable-next-line jest-dom/prefer-to-have-attribute -- XML Element, not HTMLElement
	expect( element.getAttribute( attribute ) ).toBe( value );
};

const makeParams = ( xmlStructure: string, overrides = {} ) =>
	( {
		xmlStructure,
		stylesConfig: {},
		elementConfig: {},
		widgetsCache: makeWidgetsCache(),
		...overrides,
	} ) as BuildCompositionParams;

describe( 'adaptLeafRootParams', () => {
	it( 'wraps a leaf widget root in a div-block', () => {
		// Arrange
		const params = makeParams( `<${ LEAF_WIDGET_TAG } configuration-id="heading-1" />` );

		// Act
		const result = adaptLeafRootParams( params );

		// Assert
		const doc = parseXml( result.xmlStructure );
		expect( doc.documentElement.tagName ).toBe( DIV_BLOCK_TAG );
		expect( doc.documentElement.children[ 0 ].tagName ).toBe( LEAF_WIDGET_TAG );
		expectElementAttribute( doc.documentElement, 'configuration-id', DIV_BLOCK_TITLE );
	} );

	it( 'preserves existing stylesConfig entries when wrapping', () => {
		// Arrange
		const params = makeParams( `<${ LEAF_WIDGET_TAG } configuration-id="heading-1" />`, {
			stylesConfig: { 'heading-1': { color: 'red' } },
		} );

		// Act
		const result = adaptLeafRootParams( params );

		// Assert
		expect( result.stylesConfig[ 'heading-1' ] ).toEqual( { color: 'red' } );
	} );

	it( 'does not wrap when root is a container', () => {
		// Arrange
		const params = makeParams(
			`<${ CONTAINER_TAG } configuration-id="container-1"><${ LEAF_WIDGET_TAG } configuration-id="heading-1" /></${ CONTAINER_TAG }>`
		);

		// Act
		const result = adaptLeafRootParams( params );

		// Assert
		expect( result ).toBe( params );
	} );

	it( 'preserves extra params fields unchanged', () => {
		// Arrange
		const params = makeParams( `<${ LEAF_WIDGET_TAG } configuration-id="heading-1" />`, {
			elementConfig: { 'heading-1': { title: 'Hello' } },
			stylesConfig: { 'heading-1': { color: 'red' } },
		} );

		// Act
		const result = adaptLeafRootParams( params );

		// Assert
		expect( result.stylesConfig ).toEqual( {
			'Div Block': {
				margin: ZERO_SPACING,
				padding: ZERO_SPACING,
			},
			...params.stylesConfig,
		} );
	} );

	it( 'preserves leaf element attributes when wrapping', () => {
		// Arrange
		const params = makeParams( `<${ LEAF_WIDGET_TAG } configuration-id="heading-1" />` );

		// Act
		const { xmlStructure } = adaptLeafRootParams( params );

		// Assert
		const doc = parseXml( xmlStructure );
		expectElementAttribute( doc.documentElement.children[ 0 ], 'configuration-id', 'heading-1' );
	} );

	it( 'returns unchanged params for unknown element types', () => {
		// Arrange
		const params = makeParams( '<unknown-widget configuration-id="w1" />' );

		// Act
		const result = adaptLeafRootParams( params );

		// Assert
		expect( result ).toBe( params );
	} );
} );
