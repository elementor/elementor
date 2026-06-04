import { type AnyTransformable, type PropType } from '../../types';
import { sizeLlmDialectAdapter } from '../adapters/size';

const sizeCtx = ( propType: PropType = sizePropType() ) => ( { propType } );

describe( 'llm-dialect-size-adapter', () => {
	describe( 'matches', () => {
		it( 'should match size prop types', () => {
			// Arrange
			// Act
			const matchesSize = sizeLlmDialectAdapter.matches( sizeCtx( sizePropType() ) );
			const matchesGridTrack = sizeLlmDialectAdapter.matches( sizeCtx( gridTrackSizePropType() ) );

			// Assert
			expect( matchesSize ).toBe( true );
			expect( matchesGridTrack ).toBe( true );
		} );

		it( 'should match a union wrapping a size prop type', () => {
			// Arrange
			// Act
			const matches = sizeLlmDialectAdapter.matches( sizeCtx( sizeUnionPropType() ) );

			// Assert
			expect( matches ).toBe( true );
		} );

		it( 'should not match non-size prop types', () => {
			// Arrange
			const stringPropType = { kind: 'string', key: 'string', settings: {}, meta: {} } as unknown as PropType;

			// Act
			const matches = sizeLlmDialectAdapter.matches( sizeCtx( stringPropType ) );

			// Assert
			expect( matches ).toBe( false );
		} );
	} );

	describe( 'toPropValue', () => {
		it( 'should compact nested unit and size fields', () => {
			// Arrange
			const nested = nestedSizeValue( 'px', 16 );

			// Act
			const compact = sizeLlmDialectAdapter.toPropValue?.( nested, sizeCtx() );

			// Assert
			expect( compact ).toEqual( compactSizeValue( 'px', 16 ) );
		} );

		it( 'should leave already flat inner fields unchanged', () => {
			// Arrange
			const flat = compactSizeValue( 'px', 0 );

			// Act
			const compact = sizeLlmDialectAdapter.toPropValue?.( flat, sizeCtx() );

			// Assert
			expect( compact ).toEqual( flat );
		} );

		it( 'should compact mixed nested and flat inner fields', () => {
			// Arrange
			const mixed = flatUnitNestedSizeValue( 'px', 12 );

			// Act
			const compact = sizeLlmDialectAdapter.toPropValue?.( mixed, sizeCtx() );

			// Assert
			expect( compact ).toEqual( compactSizeValue( 'px', 12 ) );
		} );

		it( 'should compact a size value when context is a union wrapping size', () => {
			// Arrange
			const nested = nestedSizeValue( 'vh', 80 );

			// Act
			const compact = sizeLlmDialectAdapter.toPropValue?.( nested, sizeCtx( sizeUnionPropType() ) );

			// Assert
			expect( compact ).toEqual( compactSizeValue( 'vh', 80 ) );
		} );

		it( 'should compact a size value in a size | global-size-variable union context', () => {
			// Arrange
			const nested = nestedSizeValue( 'vh', 80 );

			// Act
			const compact = sizeLlmDialectAdapter.toPropValue?.( nested, sizeCtx( sizeGlobalVariableUnionPropType() ) );

			// Assert
			expect( compact ).toEqual( compactSizeValue( 'vh', 80 ) );
		} );

		it( 'should leave a global-size-variable value untouched in a size union context', () => {
			// Arrange
			const globalVariable = { $$type: 'global-size-variable', value: 'e-gv-spacing-lg' } as AnyTransformable;

			// Act
			const result = sizeLlmDialectAdapter.toPropValue?.(
				globalVariable,
				sizeCtx( sizeGlobalVariableUnionPropType() )
			);

			// Assert
			expect( result ).toEqual( globalVariable );
		} );

		it( 'should leave a dynamic value untouched in a size union context', () => {
			// Arrange
			const dynamic = {
				$$type: 'dynamic',
				value: { name: 'post-some-size', group: 'post', settings: {} },
			} as AnyTransformable;

			// Act
			const result = sizeLlmDialectAdapter.toPropValue?.( dynamic, sizeCtx( sizeUnionPropType() ) );

			// Assert
			expect( result ).toEqual( dynamic );
		} );

		it( 'should compact grid-track-size values', () => {
			// Arrange
			const nested = nestedSizeValue( 'fr', 1, 'grid-track-size' );

			// Act
			const compact = sizeLlmDialectAdapter.toPropValue?.( nested, sizeCtx( gridTrackSizePropType() ) );

			// Assert
			expect( compact ).toEqual( compactSizeValue( 'fr', 1, 'grid-track-size' ) );
		} );
	} );

	describe( 'toDialectValue', () => {
		it( 'should expand flat unit and size fields', () => {
			// Arrange
			const flat = compactSizeValue( 'rem', 2 );

			// Act
			const expanded = sizeLlmDialectAdapter.toDialectValue?.( flat, sizeCtx() );

			// Assert
			expect( expanded ).toEqual( nestedSizeValue( 'rem', 2 ) );
		} );

		it( 'should leave already nested inner fields unchanged', () => {
			// Arrange
			const nested = nestedSizeValue( 'px', 16 );

			// Act
			const expanded = sizeLlmDialectAdapter.toDialectValue?.( nested, sizeCtx() );

			// Assert
			expect( expanded ).toEqual( nested );
		} );

		it( 'should expand mixed flat and nested inner fields', () => {
			// Arrange
			const mixed = flatUnitNestedSizeValue( 'px', 12 );

			// Act
			const expanded = sizeLlmDialectAdapter.toDialectValue?.( mixed, sizeCtx() );

			// Assert
			expect( expanded ).toEqual( nestedSizeValue( 'px', 12 ) );
		} );

		it( 'should expand string size values as string prop values', () => {
			// Arrange
			const flat = compactSizeValue( 'custom', 'auto' );

			// Act
			const expanded = sizeLlmDialectAdapter.toDialectValue?.( flat, sizeCtx() );

			// Assert
			expect( expanded ).toEqual( nestedSizeValue( 'custom', 'auto' ) );
		} );

		it( 'should be idempotent when inner fields are already nested', () => {
			// Arrange
			const nested = nestedSizeValue( 'px', 16 );

			// Act
			const expandedOnce = sizeLlmDialectAdapter.toDialectValue?.( nested, sizeCtx() );
			const expandedTwice = sizeLlmDialectAdapter.toDialectValue?.( expandedOnce as AnyTransformable, sizeCtx() );

			// Assert
			expect( expandedTwice ).toEqual( nested );
		} );
	} );

	describe( 'round-trip', () => {
		it( 'should round-trip nested dialect values through compact and expand', () => {
			// Arrange
			const nested = nestedSizeValue( 'rem', 2 );

			// Act
			const compact = sizeLlmDialectAdapter.toPropValue?.( nested, sizeCtx() );
			const expanded = sizeLlmDialectAdapter.toDialectValue?.( compact as AnyTransformable, sizeCtx() );

			// Assert
			expect( compact ).toEqual( compactSizeValue( 'rem', 2 ) );
			expect( expanded ).toEqual( nested );
		} );
	} );
} );

function sizePropType(): PropType {
	return {
		kind: 'object',
		key: 'size',
		settings: {},
		shape: {
			unit: { kind: 'string', key: 'string', settings: {} },
			size: {
				kind: 'union',
				prop_types: {
					number: { kind: 'number', key: 'number', settings: {} },
					string: { kind: 'string', key: 'string', settings: {} },
				},
			},
		},
		meta: {},
	} as unknown as PropType;
}

function gridTrackSizePropType(): PropType {
	return { ...sizePropType(), key: 'grid-track-size' } as unknown as PropType;
}

function sizeUnionPropType(): PropType {
	return {
		kind: 'union',
		prop_types: {
			size: sizePropType(),
			dynamic: { kind: 'plain', key: 'dynamic', settings: { categories: [ 'size' ] } },
		},
		settings: {},
		meta: {},
	} as unknown as PropType;
}

function sizeGlobalVariableUnionPropType(): PropType {
	return {
		kind: 'union',
		prop_types: {
			size: sizePropType(),
			'global-size-variable': { kind: 'string', key: 'global-size-variable', settings: {} },
		},
		settings: {},
		meta: {},
	} as unknown as PropType;
}

function nestedSizeValue( unit: string, size: string | number, $$type = 'size' ): AnyTransformable {
	return {
		$$type,
		value: {
			unit: { $$type: 'string', value: unit },
			size: { $$type: typeof size === 'number' ? 'number' : 'string', value: size },
		},
	} as AnyTransformable;
}

function flatUnitNestedSizeValue( unit: unknown, size: string | number, $$type = 'size' ): AnyTransformable {
	return {
		$$type,
		value: {
			unit,
			size: { $$type: typeof size === 'number' ? 'number' : 'string', value: size },
		},
	} as AnyTransformable;
}

function compactSizeValue( unit: unknown, size: unknown, $$type = 'size' ): AnyTransformable {
	return { $$type, value: { unit, size } } as AnyTransformable;
}
