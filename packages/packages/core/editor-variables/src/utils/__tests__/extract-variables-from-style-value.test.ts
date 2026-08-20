import { getPropSchemaFromCache, isTransformable } from '@elementor/editor-props';

import { extractVariablesFromStyleValue } from '../extract-variables-from-style-value';

jest.mock( '@elementor/editor-props', () => ( {
	getPropSchemaFromCache: jest.fn(),
	isTransformable: jest.fn(),
} ) );

const mockGetPropSchemaFromCache = jest.mocked( getPropSchemaFromCache );
const mockIsTransformable = jest.mocked( isTransformable );

function createMockPropUtil( key: string ) {
	return {
		key,
		isValid: ( prop: unknown ) => {
			const typedProp = prop as { $$type?: string; value?: unknown };
			return typedProp?.$$type === key && typeof typedProp?.value === 'string';
		},
		extract: ( prop: unknown ) => {
			const typedProp = prop as { value?: unknown };
			return typedProp?.value ?? null;
		},
	};
}

describe( 'extractVariablesFromStyleValue', () => {
	beforeEach( () => {
		mockGetPropSchemaFromCache.mockImplementation( ( key: string ) => {
			const variableTypes = [
				'global-color-variable',
				'global-font-variable',
				'global-size-variable',
				'global-custom-size-variable',
			];
			if ( variableTypes.includes( key ) ) {
				return createMockPropUtil( key ) as ReturnType< typeof getPropSchemaFromCache >;
			}
			return undefined;
		} );

		mockIsTransformable.mockImplementation( ( value: unknown ) => {
			if ( ! value || typeof value !== 'object' ) {
				return false;
			}
			const obj = value as Record< string, unknown >;
			return '$$type' in obj && typeof obj.$$type === 'string' && 'value' in obj;
		} );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return empty array for empty object', () => {
		// Arrange
		const styleValue = {};

		// Act
		const result = extractVariablesFromStyleValue( styleValue );

		// Assert
		expect( result ).toEqual( [] );
	} );

	it( 'should extract top-level color variable', () => {
		// Arrange
		const styleValue = {
			color: {
				$$type: 'global-color-variable',
				value: 'e-gv-fff34d2',
			},
		};

		// Act
		const result = extractVariablesFromStyleValue( styleValue );

		// Assert
		expect( result ).toEqual( [
			{
				type: 'global-color-variable',
				variableId: 'e-gv-fff34d2',
				controlPath: 'color',
			},
		] );
	} );

	it( 'should extract nested variable from background', () => {
		// Arrange
		const styleValue = {
			background: {
				$$type: 'background',
				value: {
					color: {
						$$type: 'global-color-variable',
						value: 'e-gv-f826663',
					},
				},
			},
		};

		// Act
		const result = extractVariablesFromStyleValue( styleValue );

		// Assert
		expect( result ).toEqual( [
			{
				type: 'global-color-variable',
				variableId: 'e-gv-f826663',
				controlPath: 'background.color',
			},
		] );
	} );

	it( 'should extract multiple variables at different levels', () => {
		// Arrange
		const styleValue = {
			color: {
				$$type: 'global-color-variable',
				value: 'e-gv-fff34d2',
			},
			background: {
				$$type: 'background',
				value: {
					color: {
						$$type: 'global-color-variable',
						value: 'e-gv-f826663',
					},
				},
			},
		};

		// Act
		const result = extractVariablesFromStyleValue( styleValue );

		// Assert
		expect( result ).toEqual( [
			{
				type: 'global-color-variable',
				variableId: 'e-gv-fff34d2',
				controlPath: 'color',
			},
			{
				type: 'global-color-variable',
				variableId: 'e-gv-f826663',
				controlPath: 'background.color',
			},
		] );
	} );

	it( 'should extract size variables', () => {
		// Arrange
		const styleValue = {
			padding: {
				$$type: 'global-size-variable',
				value: 'e-gv-size123',
			},
		};

		// Act
		const result = extractVariablesFromStyleValue( styleValue );

		// Assert
		expect( result ).toEqual( [
			{
				type: 'global-size-variable',
				variableId: 'e-gv-size123',
				controlPath: 'padding',
			},
		] );
	} );

	it( 'should extract font variables', () => {
		// Arrange
		const styleValue = {
			fontFamily: {
				$$type: 'global-font-variable',
				value: 'e-gv-font456',
			},
		};

		// Act
		const result = extractVariablesFromStyleValue( styleValue );

		// Assert
		expect( result ).toEqual( [
			{
				type: 'global-font-variable',
				variableId: 'e-gv-font456',
				controlPath: 'fontFamily',
			},
		] );
	} );

	it( 'should ignore non-variable transformable values', () => {
		// Arrange
		const styleValue = {
			background: {
				$$type: 'background',
				value: {
					type: 'gradient',
				},
			},
			color: '#FF0000',
		};

		// Act
		const result = extractVariablesFromStyleValue( styleValue );

		// Assert
		expect( result ).toEqual( [] );
	} );

	it( 'should handle mixed variable and non-variable properties', () => {
		// Arrange
		const styleValue = {
			color: {
				$$type: 'global-color-variable',
				value: 'e-gv-color1',
			},
			fontSize: '16px',
			padding: {
				$$type: 'size',
				value: '20px',
			},
		};

		// Act
		const result = extractVariablesFromStyleValue( styleValue );

		// Assert
		expect( result ).toEqual( [
			{
				type: 'global-color-variable',
				variableId: 'e-gv-color1',
				controlPath: 'color',
			},
		] );
	} );

	it( 'should handle deeply nested structures', () => {
		// Arrange
		const styleValue = {
			typography: {
				$$type: 'typography',
				value: {
					font: {
						$$type: 'font',
						value: {
							family: {
								$$type: 'global-font-variable',
								value: 'e-gv-font789',
							},
						},
					},
				},
			},
		};

		// Act
		const result = extractVariablesFromStyleValue( styleValue );

		// Assert
		expect( result ).toEqual( [
			{
				type: 'global-font-variable',
				variableId: 'e-gv-font789',
				controlPath: 'typography.font.family',
			},
		] );
	} );

	it( 'should extract custom-size variables', () => {
		// Arrange
		const styleValue = {
			margin: {
				$$type: 'global-custom-size-variable',
				value: 'e-gv-custom123',
			},
		};

		// Act
		const result = extractVariablesFromStyleValue( styleValue );

		// Assert
		expect( result ).toEqual( [
			{
				type: 'global-custom-size-variable',
				variableId: 'e-gv-custom123',
				controlPath: 'margin',
			},
		] );
	} );

	it( 'should not extract variables when prop util is not registered', () => {
		// Arrange
		mockGetPropSchemaFromCache.mockReturnValue( undefined );
		const styleValue = {
			color: {
				$$type: 'global-color-variable',
				value: 'e-gv-color1',
			},
		};

		// Act
		const result = extractVariablesFromStyleValue( styleValue );

		// Assert
		expect( result ).toEqual( [] );
	} );

	it( 'should not extract unknown variable types', () => {
		// Arrange
		const styleValue = {
			custom: {
				$$type: 'unknown-variable',
				value: 'some-value',
			},
		};

		// Act
		const result = extractVariablesFromStyleValue( styleValue );

		// Assert
		expect( result ).toEqual( [] );
	} );
} );
