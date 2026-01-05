import { createMockPropType } from 'test-utils';

import { createTransformer } from '../../transformers/create-transformer';
import { createTransformersRegistry } from '../../transformers/create-transformers-registry';
import { createPropsResolver } from '../create-props-resolver';

describe( 'createPropsResolver', () => {
	it( 'should resolve simple props', async () => {
		// Arrange.
		const transformers = createTransformersRegistry().register(
			'int',
			createTransformer( ( value: number ) => value + 1 )
		);

		const resolve = createPropsResolver( {
			transformers,
			schema: { int: createMockPropType( { kind: 'plain', key: 'int' } ) },
		} );

		// Act.
		const result = await resolve( {
			props: {
				int: { $$type: 'int', value: 0 },
			},
		} );

		// Assert.
		expect( result ).toEqual( { int: 1 } );
	} );

	it( 'should skip disabled props', async () => {
		// Arrange.
		const transformers = createTransformersRegistry().register(
			'int',
			createTransformer( ( value: number ) => value + 1 )
		);

		const resolve = createPropsResolver( {
			transformers,
			schema: { int: createMockPropType( { kind: 'plain', key: 'int' } ) },
		} );

		// Act.
		const result = await resolve( {
			props: {
				int: {
					$$type: 'int',
					value: 1,
					disabled: true,
				},
			},
		} );

		// Assert.
		expect( result ).toEqual( { int: null } );
	} );

	it( 'should fallback to default value when there is no value', async () => {
		// Arrange.
		const transformers = createTransformersRegistry().register(
			'int',
			createTransformer( ( value: number ) => value + 1 )
		);

		const resolve = createPropsResolver( {
			transformers,
			schema: {
				int: createMockPropType( {
					kind: 'plain',
					key: 'int',
					default: { $$type: 'int', value: 3 },
				} ),
			},
		} );

		// Act.
		const result = await resolve( { props: {} } );

		// Assert.
		expect( result ).toEqual( { int: 4 } );
	} );

	it( 'should skip props that are not in the schema', async () => {
		// Arrange.
		const transformers = createTransformersRegistry().register(
			'int',
			createTransformer( ( value: number ) => value + 1 )
		);

		const resolve = createPropsResolver( {
			transformers,
			schema: {
				int: createMockPropType( { kind: 'plain', key: 'int' } ),
			},
		} );

		// Act.
		const result = await resolve( {
			props: {
				int: {
					$$type: 'int',
					value: 1,
				},
				'not-in-schema': {
					$$type: 'int',
					value: 1,
				},
			},
		} );

		// Assert.
		expect( result ).toEqual( { int: 2 } );
	} );

	it( "should skip props that don't have a transformer", async () => {
		// Arrange.
		const transformers = createTransformersRegistry().register(
			'int',
			createTransformer( ( value: number ) => value + 1 )
		);

		const resolve = createPropsResolver( {
			transformers,
			schema: {
				int: createMockPropType( { kind: 'plain', key: 'int' } ),
				invalid: createMockPropType( { kind: 'plain', key: 'invalid' } ),
			},
		} );

		// Act.
		const result = await resolve( {
			props: {
				int: {
					$$type: 'int',
					value: 1,
				},
				invalid: {
					$$type: 'invalid',
					value: 1,
				},
			},
		} );

		// Assert.
		expect( result ).toEqual( { int: 2, invalid: null } );
	} );

	it( 'should not skip props if there is a fallback transformer', async () => {
		// Arrange.
		const transformers = createTransformersRegistry()
			.register(
				'int',
				createTransformer( ( value: number ) => value + 1 )
			)
			.registerFallback( createTransformer( ( value: string ) => value + ' world' ) );

		const resolve = createPropsResolver( {
			transformers,
			schema: {
				int: createMockPropType( { kind: 'plain', key: 'int' } ),
				greet: createMockPropType( { kind: 'plain', key: 'string' } ),
			},
		} );

		// Act.
		const result = await resolve( {
			props: {
				int: {
					$$type: 'int',
					value: 1,
				},
				greet: {
					$$type: 'string',
					value: 'hello',
				},
			},
		} );

		// Assert.
		expect( result ).toEqual( { int: 2, greet: 'hello world' } );
	} );

	it( 'should return null if the prop is value is not match the prop type', async () => {
		// Arrange.
		const transformers = createTransformersRegistry()
			.register(
				'int',
				createTransformer( ( value: number ) => value + 1 )
			)
			.registerFallback( createTransformer( ( value: string ) => value + ' world' ) );

		const resolve = createPropsResolver( {
			transformers,
			schema: {
				int: createMockPropType( { kind: 'plain', key: 'int' } ),
				greet: createMockPropType( { kind: 'plain', key: 'string' } ),
			},
		} );

		// Act.
		const result = await resolve( {
			props: {
				int: {
					$$type: 'int',
					value: 1,
				},
				greet: {
					$$type: 'int',
					value: 2,
				},
			},
		} );

		// Assert.
		expect( result ).toEqual( { int: 2, greet: null } );
	} );

	it( 'should skip props when their transformer throws an error', async () => {
		const transformers = createTransformersRegistry()
			.register(
				'int',
				createTransformer( ( value: number ) => value + 1 )
			)
			.register(
				'throws',
				createTransformer< number >( () => {
					throw new Error( 'Not Working!' );
				} )
			);

		const resolve = createPropsResolver( {
			transformers,
			schema: {
				int: createMockPropType( { kind: 'plain', key: 'int' } ),
				invalid: createMockPropType( { kind: 'plain', key: 'throws' } ),
			},
		} );

		// Act.
		const result = await resolve( {
			props: {
				int: {
					$$type: 'int',
					value: 1,
				},
				throws: {
					$$type: 'throws',
					value: 1,
				},
			},
		} );

		// Assert.
		expect( result ).toEqual( { int: 2, invalid: null } );
	} );

	it( 'should trigger onResolve when resolving a prop', async () => {
		const transformers = createTransformersRegistry().register(
			'int',
			createTransformer( ( value: number ) => value + 1 )
		);

		const onResolve = jest.fn();

		const resolve = createPropsResolver( {
			transformers,
			schema: {
				int: createMockPropType( { kind: 'plain', key: 'int' } ),
				int2: createMockPropType( { kind: 'plain', key: 'int' } ),
			},
			onPropResolve: onResolve,
		} );

		// Act.
		await resolve( {
			props: {
				int: {
					$$type: 'int',
					value: 1,
				},
				int2: {
					$$type: 'int',
					value: 3,
				},
			},
		} );

		// Assert.
		expect( onResolve ).toHaveBeenCalledTimes( 2 );
		expect( onResolve ).toHaveBeenNthCalledWith( 1, { key: 'int', value: 2 } );
		expect( onResolve ).toHaveBeenNthCalledWith( 2, { key: 'int2', value: 4 } );
	} );

	it( 'should pass renderContext to transformers', async () => {
		// Arrange.
		const CONTEXT_KEY = 'test-key';
		const CONTEXT_VALUE = 'from-context';

		const transformers = createTransformersRegistry().register(
			'context-aware',
			createTransformer< { key: string } >( ( value, options ) => {
				return options.renderContext?.[ value.key ] ?? 'fallback';
			} )
		);

		const resolve = createPropsResolver( {
			transformers,
			schema: {
				text: createMockPropType( { kind: 'plain', key: 'context-aware' } ),
			},
		} );

		// Act.
		const result = await resolve( {
			props: {
				text: { $$type: 'context-aware', value: { key: CONTEXT_KEY } },
			},
			renderContext: { [ CONTEXT_KEY ]: CONTEXT_VALUE },
		} );

		// Assert.
		expect( result ).toEqual( { text: CONTEXT_VALUE } );
	} );

	it( 'should use fallback when renderContext is not provided', async () => {
		// Arrange.
		const transformers = createTransformersRegistry().register(
			'context-aware',
			createTransformer< { key: string } >( ( value, options ) => {
				return options.renderContext?.[ value.key ] ?? 'fallback';
			} )
		);

		const resolve = createPropsResolver( {
			transformers,
			schema: {
				text: createMockPropType( { kind: 'plain', key: 'context-aware' } ),
			},
		} );

		// Act.
		const result = await resolve( {
			props: {
				text: { $$type: 'context-aware', value: { key: 'any-key' } },
			},
		} );

		// Assert.
		expect( result ).toEqual( { text: 'fallback' } );
	} );

	it( 'should propagate renderContext through nested object props', async () => {
		// Arrange.
		const CONTEXT_KEY = 'nested-key';
		const CONTEXT_VALUE = 'nested-context';

		const transformers = createTransformersRegistry()
			.register(
				'object',
				createTransformer< unknown >( ( value ) => value )
			)
			.register(
				'context-aware',
				createTransformer< { key: string } >( ( value, options ) => {
					return options.renderContext?.[ value.key ] ?? 'fallback';
				} )
			);

		const nestedSchema = {
			inner: createMockPropType( { kind: 'plain', key: 'context-aware' } ),
		};

		const resolve = createPropsResolver( {
			transformers,
			schema: {
				outer: createMockPropType( { kind: 'object', key: 'object', shape: nestedSchema } ),
			},
		} );

		// Act.
		const result = await resolve( {
			props: {
				outer: {
					$$type: 'object',
					value: {
						inner: { $$type: 'context-aware', value: { key: CONTEXT_KEY } },
					},
				},
			},
			renderContext: { [ CONTEXT_KEY ]: CONTEXT_VALUE },
		} );

		// Assert.
		expect( result ).toEqual( { outer: { inner: CONTEXT_VALUE } } );
	} );

	it( 'should propagate renderContext through array props', async () => {
		// Arrange.
		const CONTEXT_KEY = 'array-key';
		const CONTEXT_VALUE = 'array-context';

		const transformers = createTransformersRegistry()
			.register(
				'array',
				createTransformer< unknown >( ( value ) => value )
			)
			.register(
				'context-aware',
				createTransformer< { key: string } >( ( value, options ) => {
					return options.renderContext?.[ value.key ] ?? 'fallback';
				} )
			);

		const resolve = createPropsResolver( {
			transformers,
			schema: {
				items: createMockPropType( {
					kind: 'array',
					key: 'array',
					item_prop_type: createMockPropType( { kind: 'plain', key: 'context-aware' } ),
				} ),
			},
		} );

		// Act.
		const result = await resolve( {
			props: {
				items: {
					$$type: 'array',
					value: [
						{ $$type: 'context-aware', value: { key: CONTEXT_KEY } },
						{ $$type: 'context-aware', value: { key: CONTEXT_KEY } },
					],
				},
			},
			renderContext: { [ CONTEXT_KEY ]: CONTEXT_VALUE },
		} );

		// Assert.
		expect( result ).toEqual( { items: [ CONTEXT_VALUE, CONTEXT_VALUE ] } );
	} );
} );
