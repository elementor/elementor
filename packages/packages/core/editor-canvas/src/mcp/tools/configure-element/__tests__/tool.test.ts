import { getContainer, getWidgetsCache } from '@elementor/editor-elements';

import { doUpdateElementProperty, UnsupportedPropertyError } from '../../../utils/do-update-element-property';
import { initConfigureElementTool } from '../tool';

jest.mock( '@elementor/editor-elements', () => ( {
	getContainer: jest.fn(),
	getWidgetsCache: jest.fn(),
} ) );

jest.mock( '@elementor/editor-mcp', () => ( {
	dispatchMcpStylesAppliedEvent: jest.fn(),
} ) );

jest.mock( '@elementor/editor-props', () => ( {
	Schema: { isPropKeyConfigurable: () => true },
} ) );

jest.mock( '../prompt', () => ( {
	CONFIGURE_ELEMENT_GUIDE_URI: 'configure-element-guide-uri',
	generatePrompt: () => '',
} ) );

jest.mock( '../../../resources/widgets-schema-resource', () => ( {
	WIDGET_SCHEMA_URI: 'elementor://widgets/schema/{widgetType}',
} ) );

jest.mock( '../../../resources/dynamic-tags-resource', () => ( {
	DYNAMIC_TAGS_URI: 'elementor://dynamic-tags',
} ) );

jest.mock( '../../../utils/resolve-canonical-prop-name', () => ( {
	resolveCanonicalPropKeys: ( _elementType: string, props: Record< string, unknown > ) => props,
} ) );

jest.mock( '../../../utils/convert-css-to-atomic', () => ( {
	convertCssToAtomic: jest.fn().mockResolvedValue( { props: {}, customCss: '' } ),
} ) );

jest.mock( '../../../utils/do-update-element-property', () => {
	class MockUnsupportedPropertyError extends Error {
		public readonly elementType: string;
		public readonly propertyName: string;
		constructor( elementType: string, propertyName: string ) {
			super( `Property "${ propertyName }" does not exist on element type "${ elementType }".` );
			this.name = 'UnsupportedPropertyError';
			this.elementType = elementType;
			this.propertyName = propertyName;
		}
	}
	return { UnsupportedPropertyError: MockUnsupportedPropertyError, doUpdateElementProperty: jest.fn() };
} );

const ELEMENT_ID = 'el-1';
const ELEMENT_TYPE = 'e-youtube';

type Handler = ( params: {
	elementId: string;
	elementType: string;
	propertiesToChange: Record< string, unknown >;
	style: Record< string, string | null >;
} ) => Promise< { success: boolean; warnings?: string } >;

const getHandler = (): Handler => {
	const addTool = jest.fn();
	initConfigureElementTool( { addTool, resource: jest.fn() } as never );
	return addTool.mock.calls[ 0 ][ 0 ].handler;
};

describe( 'configure-element handler unsupported props', () => {
	beforeEach( () => {
		jest.mocked( getWidgetsCache ).mockReturnValue( {
			[ ELEMENT_TYPE ]: { atomic_props_schema: { title: { key: 'title' } } },
		} as never );
		jest.mocked( getContainer ).mockReturnValue( {
			settings: { get: () => ELEMENT_TYPE },
		} as never );
		jest.mocked( doUpdateElementProperty ).mockReset();
	} );

	it( 'skips an unsupported prop, reports it in warnings, and still applies supported props', async () => {
		// Arrange
		jest.mocked( doUpdateElementProperty ).mockImplementation( ( { propertyName } ) => {
			if ( 'link' === propertyName ) {
				throw new UnsupportedPropertyError( ELEMENT_TYPE, 'link', [ 'title' ] );
			}
		} );
		const handler = getHandler();

		// Act
		const result = await handler( {
			elementId: ELEMENT_ID,
			elementType: ELEMENT_TYPE,
			propertiesToChange: { title: { $$type: 'string', value: 'Hi' }, link: { $$type: 'link', value: {} } },
			style: {},
		} );

		// Assert
		expect( result.success ).toBe( true );
		expect( result.warnings ).toContain( 'link' );
		expect( doUpdateElementProperty ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'returns no warnings when every prop is supported', async () => {
		// Arrange
		jest.mocked( doUpdateElementProperty ).mockImplementation( () => undefined );
		const handler = getHandler();

		// Act
		const result = await handler( {
			elementId: ELEMENT_ID,
			elementType: ELEMENT_TYPE,
			propertiesToChange: { title: { $$type: 'string', value: 'Hi' } },
			style: {},
		} );

		// Assert
		expect( result.success ).toBe( true );
		expect( result.warnings ).toBeUndefined();
	} );

	it( 'rethrows non-UnsupportedPropertyError failures', async () => {
		// Arrange
		jest.mocked( doUpdateElementProperty ).mockImplementation( () => {
			throw new Error( 'Invalid PropValue' );
		} );
		const handler = getHandler();

		// Act & Assert
		await expect(
			handler( {
				elementId: ELEMENT_ID,
				elementType: ELEMENT_TYPE,
				propertiesToChange: { title: { $$type: 'string', value: 'Hi' } },
				style: {},
			} )
		).rejects.toThrow( /Invalid PropValue/ );
	} );
} );
