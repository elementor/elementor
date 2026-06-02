import { type AnyTransformable, type PropType } from '../../types';
import { sizeLlmDialectAdapter } from '../adapters/size';

const SIZE_PROP_TYPE = {
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

const GRID_TRACK_SIZE_PROP_TYPE = {
	...SIZE_PROP_TYPE,
	key: 'grid-track-size',
} as unknown as PropType;

const SIZE_UNION_PROP_TYPE = {
	kind: 'union',
	prop_types: {
		size: SIZE_PROP_TYPE,
		dynamic: { kind: 'plain', key: 'dynamic', settings: { categories: [ 'size' ] } },
	},
	settings: {},
	meta: {},
} as unknown as PropType;

const SIZE_GLOBAL_VARIABLE_UNION_PROP_TYPE = {
	kind: 'union',
	prop_types: {
		size: SIZE_PROP_TYPE,
		'global-size-variable': { kind: 'string', key: 'global-size-variable', settings: {} },
	},
	settings: {},
	meta: {},
} as unknown as PropType;

const STRING_PROP_TYPE = {
	kind: 'string',
	key: 'string',
	settings: {},
	meta: {},
} as unknown as PropType;

const sizeCtx = ( propType: PropType = SIZE_PROP_TYPE ) => ( { propType } );

describe( 'llm-dialect-size-adapter', () => {
	describe( 'matches', () => {
		it( 'should match size prop types', () => {
			// Arrange
			// Act
			const matchesSize = sizeLlmDialectAdapter.matches( sizeCtx( SIZE_PROP_TYPE ) );
			const matchesGridTrack = sizeLlmDialectAdapter.matches( sizeCtx( GRID_TRACK_SIZE_PROP_TYPE ) );

			// Assert
			expect( matchesSize ).toBe( true );
			expect( matchesGridTrack ).toBe( true );
		} );

		it( 'should match a union wrapping a size prop type', () => {
			// Arrange
			// Act
			const matches = sizeLlmDialectAdapter.matches( sizeCtx( SIZE_UNION_PROP_TYPE ) );

			// Assert
			expect( matches ).toBe( true );
		} );

		it( 'should not match non-size prop types', () => {
			// Arrange
			// Act
			const matches = sizeLlmDialectAdapter.matches( sizeCtx( STRING_PROP_TYPE ) );

			// Assert
			expect( matches ).toBe( false );
		} );
	} );

	describe( 'toPropValue', () => {
		it( 'should compact nested unit and size fields', () => {
			// Arrange
			const nested = {
				$$type: 'size',
				value: {
					unit: { $$type: 'string', value: 'px' },
					size: { $$type: 'number', value: 16 },
				},
			} as AnyTransformable;

			// Act
			const compact = sizeLlmDialectAdapter.toPropValue?.( nested, sizeCtx() );

			// Assert
			expect( compact ).toEqual( {
				$$type: 'size',
				value: {
					unit: 'px',
					size: 16,
				},
			} );
		} );

		it( 'should leave already flat inner fields unchanged', () => {
			// Arrange
			const flat = {
				$$type: 'size',
				value: {
					unit: 'px',
					size: 0,
				},
			} as AnyTransformable;

			// Act
			const compact = sizeLlmDialectAdapter.toPropValue?.( flat, sizeCtx() );

			// Assert
			expect( compact ).toEqual( flat );
		} );

		it( 'should compact mixed nested and flat inner fields', () => {
			// Arrange
			const mixed = {
				$$type: 'size',
				value: {
					unit: 'px',
					size: { $$type: 'number', value: 12 },
				},
			} as AnyTransformable;

			// Act
			const compact = sizeLlmDialectAdapter.toPropValue?.( mixed, sizeCtx() );

			// Assert
			expect( compact ).toEqual( {
				$$type: 'size',
				value: {
					unit: 'px',
					size: 12,
				},
			} );
		} );

		it( 'should compact a size value when context is a union wrapping size', () => {
			// Arrange
			const nested = {
				$$type: 'size',
				value: {
					unit: { $$type: 'string', value: 'vh' },
					size: { $$type: 'number', value: 80 },
				},
			} as AnyTransformable;

			// Act
			const compact = sizeLlmDialectAdapter.toPropValue?.( nested, sizeCtx( SIZE_UNION_PROP_TYPE ) );

			// Assert
			expect( compact ).toEqual( {
				$$type: 'size',
				value: {
					unit: 'vh',
					size: 80,
				},
			} );
		} );

		it( 'should compact a size value in a size | global-size-variable union context', () => {
			// Arrange
			const nested = {
				$$type: 'size',
				value: {
					unit: { $$type: 'string', value: 'vh' },
					size: { $$type: 'number', value: 80 },
				},
			} as AnyTransformable;

			// Act
			const compact = sizeLlmDialectAdapter.toPropValue?.(
				nested,
				sizeCtx( SIZE_GLOBAL_VARIABLE_UNION_PROP_TYPE )
			);

			// Assert
			expect( compact ).toEqual( {
				$$type: 'size',
				value: {
					unit: 'vh',
					size: 80,
				},
			} );
		} );

		it( 'should leave a global-size-variable value untouched in a size union context', () => {
			// Arrange
			const globalVariable = {
				$$type: 'global-size-variable',
				value: 'e-gv-spacing-lg',
			} as AnyTransformable;

			// Act
			const result = sizeLlmDialectAdapter.toPropValue?.(
				globalVariable,
				sizeCtx( SIZE_GLOBAL_VARIABLE_UNION_PROP_TYPE )
			);

			// Assert
			expect( result ).toEqual( globalVariable );
		} );

		it( 'should leave a dynamic value untouched in a size union context', () => {
			// Arrange
			const dynamic = {
				$$type: 'dynamic',
				value: {
					name: 'post-some-size',
					group: 'post',
					settings: {},
				},
			} as AnyTransformable;

			// Act
			const result = sizeLlmDialectAdapter.toPropValue?.( dynamic, sizeCtx( SIZE_UNION_PROP_TYPE ) );

			// Assert
			expect( result ).toEqual( dynamic );
		} );

		it( 'should compact grid-track-size values', () => {
			// Arrange
			const nested = {
				$$type: 'grid-track-size',
				value: {
					unit: { $$type: 'string', value: 'fr' },
					size: { $$type: 'number', value: 1 },
				},
			} as AnyTransformable;

			// Act
			const compact = sizeLlmDialectAdapter.toPropValue?.( nested, sizeCtx( GRID_TRACK_SIZE_PROP_TYPE ) );

			// Assert
			expect( compact ).toEqual( {
				$$type: 'grid-track-size',
				value: {
					unit: 'fr',
					size: 1,
				},
			} );
		} );
	} );

	describe( 'toDialectValue', () => {
		it( 'should expand flat unit and size fields', () => {
			// Arrange
			const flat = {
				$$type: 'size',
				value: {
					unit: 'rem',
					size: 2,
				},
			} as AnyTransformable;

			// Act
			const expanded = sizeLlmDialectAdapter.toDialectValue?.( flat, sizeCtx() );

			// Assert
			expect( expanded ).toEqual( {
				$$type: 'size',
				value: {
					unit: { $$type: 'string', value: 'rem' },
					size: { $$type: 'number', value: 2 },
				},
			} );
		} );

		it( 'should leave already nested inner fields unchanged', () => {
			// Arrange
			const nested = {
				$$type: 'size',
				value: {
					unit: { $$type: 'string', value: 'px' },
					size: { $$type: 'number', value: 16 },
				},
			} as AnyTransformable;

			// Act
			const expanded = sizeLlmDialectAdapter.toDialectValue?.( nested, sizeCtx() );

			// Assert
			expect( expanded ).toEqual( nested );
		} );

		it( 'should expand mixed flat and nested inner fields', () => {
			// Arrange
			const mixed = {
				$$type: 'size',
				value: {
					unit: 'px',
					size: { $$type: 'number', value: 12 },
				},
			} as AnyTransformable;

			// Act
			const expanded = sizeLlmDialectAdapter.toDialectValue?.( mixed, sizeCtx() );

			// Assert
			expect( expanded ).toEqual( {
				$$type: 'size',
				value: {
					unit: { $$type: 'string', value: 'px' },
					size: { $$type: 'number', value: 12 },
				},
			} );
		} );

		it( 'should expand string size values as string prop values', () => {
			// Arrange
			const flat = {
				$$type: 'size',
				value: {
					unit: 'custom',
					size: 'auto',
				},
			} as AnyTransformable;

			// Act
			const expanded = sizeLlmDialectAdapter.toDialectValue?.( flat, sizeCtx() );

			// Assert
			expect( expanded ).toEqual( {
				$$type: 'size',
				value: {
					unit: { $$type: 'string', value: 'custom' },
					size: { $$type: 'string', value: 'auto' },
				},
			} );
		} );

		it( 'should be idempotent when inner fields are already nested', () => {
			// Arrange
			const nested = {
				$$type: 'size',
				value: {
					unit: { $$type: 'string', value: 'px' },
					size: { $$type: 'number', value: 16 },
				},
			} as AnyTransformable;

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
			const nested = {
				$$type: 'size',
				value: {
					unit: { $$type: 'string', value: 'rem' },
					size: { $$type: 'number', value: 2 },
				},
			} as AnyTransformable;

			// Act
			const compact = sizeLlmDialectAdapter.toPropValue?.( nested, sizeCtx() );
			const expanded = sizeLlmDialectAdapter.toDialectValue?.( compact as AnyTransformable, sizeCtx() );

			// Assert
			expect( compact ).toEqual( {
				$$type: 'size',
				value: {
					unit: 'rem',
					size: 2,
				},
			} );
			expect( expanded ).toEqual( nested );
		} );
	} );
} );
