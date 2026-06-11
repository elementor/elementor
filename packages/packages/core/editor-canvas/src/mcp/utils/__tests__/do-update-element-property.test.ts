import {
	getElementStyles,
	getWidgetsCache,
	updateElementSettings,
	updateElementStyle,
} from '@elementor/editor-elements';
import { Schema } from '@elementor/editor-props';
import { getStylesSchema, getVariantByMeta } from '@elementor/editor-styles';
import { __privateRunCommandSync } from '@elementor/editor-v1-adapters';

import { doUpdateElementProperty } from '../do-update-element-property';

jest.mock( '@elementor/editor-elements', () => ( {
	createElementStyle: jest.fn(),
	getElementStyles: jest.fn(),
	getWidgetsCache: jest.fn(),
	updateElementSettings: jest.fn(),
	updateElementStyle: jest.fn(),
} ) );

jest.mock( '@elementor/editor-props', () => ( {
	getPropSchemaFromCache: jest.fn(),
	Schema: {
		adjustLlmPropValueSchema: jest.fn( ( value: unknown ) => value ),
		validatePropValue: jest.fn(),
	},
} ) );

jest.mock( '@elementor/editor-styles', () => ( {
	getStylesSchema: jest.fn( () => ( {} ) ),
	getVariantByMeta: jest.fn(),
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateRunCommandSync: jest.fn(),
} ) );

const ELEMENT_ID = 'test-element-id';
const ELEMENT_TYPE = 'atomic-heading';
const EXPECTED_JSON_SCHEMA_SNIPPET = '{"type":"object"}';
const PROPERTY_NAME = 'title';
const PROP_SCHEMA_ENTRY = { key: 'titlePropKey' };
const LOCAL_STYLE_ID = 'local-style-id';
const EXISTING_CUSTOM_CSS = 'padding: 2rem;';
const ADDITIONAL_CUSTOM_CSS = 'font-size: 1.5rem;';

const widgetsCacheFixture = {
	[ ELEMENT_TYPE ]: {
		atomic_props_schema: {
			[ PROPERTY_NAME ]: PROP_SCHEMA_ENTRY,
		},
	},
};

describe( 'doUpdateElementProperty', () => {
	beforeEach( () => {
		Object.assign( window, {
			elementorV2: {
				editorVariables: {
					Utils: {
						globalVariablesLLMResolvers: [],
					},
				},
			},
		} );
		// @ts-ignore: Mock values for test
		jest.mocked( getWidgetsCache ).mockReturnValue( widgetsCacheFixture );
		// @ts-ignore: Mock values for test
		jest.mocked( Schema.adjustLlmPropValueSchema ).mockImplementation( ( value: unknown ) => value );
		jest.mocked( Schema.validatePropValue ).mockReset();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'throws when Schema.validatePropValue reports invalid PropValue and does not persist', () => {
		// Arrange
		const propertyValue = { invalid: true };
		jest.mocked( Schema.validatePropValue ).mockReturnValue( {
			jsonSchema: EXPECTED_JSON_SCHEMA_SNIPPET,
			valid: false,
			errorMessages: 'error',
			errors: [],
		} );

		// Act
		let thrown: unknown;
		try {
			doUpdateElementProperty( {
				elementId: ELEMENT_ID,
				elementType: ELEMENT_TYPE,
				propertyName: PROPERTY_NAME,
				propertyValue,
			} );
		} catch ( error ) {
			thrown = error;
		}

		// Assert
		expect( thrown ).toBeInstanceOf( Error );
		expect( ( thrown as Error ).message ).toMatch( /Invalid PropValue/ );
		expect( ( thrown as Error ).message ).toContain( ELEMENT_ID );
		expect( ( thrown as Error ).message ).toContain( PROP_SCHEMA_ENTRY.key );
		expect( ( thrown as Error ).message ).toContain( EXPECTED_JSON_SCHEMA_SNIPPET );
		expect( Schema.validatePropValue ).toHaveBeenCalledWith( PROP_SCHEMA_ENTRY, propertyValue );
		expect( updateElementSettings ).not.toHaveBeenCalled();
		expect( __privateRunCommandSync ).not.toHaveBeenCalled();
	} );

	it( 'updates settings when Schema.validatePropValue reports valid PropValue', () => {
		// Arrange
		const propertyValue = 'resolved-title';
		jest.mocked( Schema.validatePropValue ).mockReturnValue( {
			jsonSchema: EXPECTED_JSON_SCHEMA_SNIPPET,
			valid: true,
			errorMessages: [],
			errors: [],
		} );

		// Act
		doUpdateElementProperty( {
			elementId: ELEMENT_ID,
			elementType: ELEMENT_TYPE,
			propertyName: PROPERTY_NAME,
			propertyValue,
		} );

		// Assert
		expect( Schema.validatePropValue ).toHaveBeenCalledWith( PROP_SCHEMA_ENTRY, propertyValue );
		expect( updateElementSettings ).toHaveBeenCalledTimes( 1 );
		expect( updateElementSettings ).toHaveBeenCalledWith( {
			id: ELEMENT_ID,
			props: {
				[ PROPERTY_NAME ]: propertyValue,
			},
			withHistory: false,
		} );
		expect( __privateRunCommandSync ).toHaveBeenCalledWith(
			'document/save/set-is-modified',
			{ status: true },
			{ internal: true }
		);
	} );

	it( 'replaces existing local style custom_css by default', () => {
		// Arrange
		jest.mocked( getElementStyles ).mockReturnValue( {
			[ LOCAL_STYLE_ID ]: {
				id: LOCAL_STYLE_ID,
				label: 'local',
				type: 'class',
				variants: [],
			},
		} );
		jest.mocked( getVariantByMeta ).mockReturnValue( {
			meta: { breakpoint: 'desktop', state: null },
			props: {},
			custom_css: { raw: btoa( EXISTING_CUSTOM_CSS ) },
		} );

		// Act
		doUpdateElementProperty( {
			elementId: ELEMENT_ID,
			elementType: ELEMENT_TYPE,
			propertyName: '_styles',
			propertyValue: {
				custom_css: ADDITIONAL_CUSTOM_CSS,
			},
		} );

		// Assert
		expect( updateElementStyle ).toHaveBeenCalledWith(
			expect.objectContaining( {
				custom_css: {
					raw: btoa( ADDITIONAL_CUSTOM_CSS ),
				},
			} )
		);
	} );

	it( 'merges incoming custom_css with stored css when customCssWriteMode is merge-with-stored', () => {
		// Arrange
		jest.mocked( getElementStyles ).mockReturnValue( {
			[ LOCAL_STYLE_ID ]: {
				id: LOCAL_STYLE_ID,
				label: 'local',
				type: 'class',
				variants: [],
			},
		} );
		jest.mocked( getVariantByMeta ).mockReturnValue( {
			meta: { breakpoint: 'desktop', state: null },
			props: {},
			custom_css: { raw: btoa( EXISTING_CUSTOM_CSS ) },
		} );

		// Act
		doUpdateElementProperty( {
			elementId: ELEMENT_ID,
			elementType: ELEMENT_TYPE,
			propertyName: '_styles',
			propertyValue: {
				custom_css: ADDITIONAL_CUSTOM_CSS,
			},
			customCssWriteMode: 'merge-with-stored',
		} );

		// Assert
		expect( updateElementStyle ).toHaveBeenCalledWith(
			expect.objectContaining( {
				custom_css: {
					raw: btoa( `${ EXISTING_CUSTOM_CSS }\n${ ADDITIONAL_CUSTOM_CSS }` ),
				},
			} )
		);
	} );

	it( 'passes a null style value through unresolved so the editor resets the prop to default', () => {
		// Arrange
		jest.mocked( getStylesSchema ).mockReturnValue( {
			color: { key: 'colorPropKey', kind: 'plain' },
		} as never );
		jest.mocked( getElementStyles ).mockReturnValue( {
			[ LOCAL_STYLE_ID ]: {
				id: LOCAL_STYLE_ID,
				label: 'local',
				type: 'class',
				variants: [],
			},
		} );
		jest.mocked( getVariantByMeta ).mockReturnValue( {
			meta: { breakpoint: 'desktop', state: null },
			props: {},
			custom_css: null,
		} );

		// Act
		doUpdateElementProperty( {
			elementId: ELEMENT_ID,
			elementType: ELEMENT_TYPE,
			propertyName: '_styles',
			propertyValue: {
				color: null,
			},
		} );

		// Assert
		expect( Schema.adjustLlmPropValueSchema ).not.toHaveBeenCalled();
		expect( updateElementStyle ).toHaveBeenCalledWith(
			expect.objectContaining( {
				props: { color: null },
			} )
		);
	} );
} );
