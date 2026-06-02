import {
	getElementStyles,
	getWidgetsCache,
	updateElementSettings,
	updateElementStyle,
} from '@elementor/editor-elements';
import { Schema } from '@elementor/editor-props';
import { getVariantByMeta } from '@elementor/editor-styles';
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
		propFromLlm: jest.fn( ( value: unknown ) => value ),
		validateLlmJson: jest.fn(),
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
const PROPERTY_NAME = 'title';
const LOCAL_STYLE_ID = 'local-style-id';
const EXISTING_CUSTOM_CSS = 'padding: 2rem;';
const ADDITIONAL_CUSTOM_CSS = 'font-size: 1.5rem;';
const PROP_SCHEMA_ENTRY = { key: 'titlePropKey' };

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
		jest.mocked( Schema.propFromLlm ).mockImplementation( ( value: unknown ) => value );
		jest.mocked( Schema.validateLlmJson ).mockReset();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'throws when Schema.validateLlmJson reports invalid LLM value and does not persist', () => {
		// Arrange
		const propertyValue = { invalid: true };
		const convertedValue = { $$type: 'string', value: 'converted' };
		jest.mocked( Schema.propFromLlm ).mockReturnValue( convertedValue );
		jest.mocked( Schema.validateLlmJson ).mockReturnValue( {
			jsonSchema: { type: 'object' },
			valid: false,
			errors: [ 'root: invalid' ],
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
		expect( ( thrown as Error ).message ).toMatch( /Invalid LLM PropValue/ );
		expect( ( thrown as Error ).message ).toContain( ELEMENT_ID );
		expect( ( thrown as Error ).message ).toContain( PROP_SCHEMA_ENTRY.key );
		expect( Schema.validateLlmJson ).toHaveBeenCalledWith( PROP_SCHEMA_ENTRY, propertyValue );
		expect( Schema.propFromLlm ).not.toHaveBeenCalled();
		expect( updateElementSettings ).not.toHaveBeenCalled();
		expect( __privateRunCommandSync ).not.toHaveBeenCalled();
	} );

	it( 'updates settings when Schema.validateLlmJson reports valid LLM value', () => {
		// Arrange
		const propertyValue = 'resolved-title';
		const convertedValue = { $$type: 'string', value: propertyValue };
		jest.mocked( Schema.propFromLlm ).mockReturnValue( convertedValue );
		jest.mocked( Schema.validateLlmJson ).mockReturnValue( {
			jsonSchema: { type: 'object' },
			valid: true,
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
		expect( Schema.validateLlmJson ).toHaveBeenCalledWith( PROP_SCHEMA_ENTRY, propertyValue );
		expect( Schema.propFromLlm ).toHaveBeenCalledWith( propertyValue, {
			propType: PROP_SCHEMA_ENTRY,
			transformers: [],
		} );
		expect( updateElementSettings ).toHaveBeenCalledTimes( 1 );
		expect( updateElementSettings ).toHaveBeenCalledWith( {
			id: ELEMENT_ID,
			props: {
				[ PROPERTY_NAME ]: convertedValue,
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
} );
