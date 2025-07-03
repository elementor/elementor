import * as React from 'react';
import { createMockPropType, createMockPropUtil, createMockSchema } from 'test-utils';
import { type PropType, stringPropTypeUtil } from '@elementor/editor-props';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';

describe( 'useBoundProp', () => {
	it( 'should throw error if used outside of context', () => {
		// Act & Assert.
		expect( () => {
			renderHook( () => useBoundProp() );
		} ).toThrow( 'Hook used outside of provider' );

		// Suppress console.error from React.
		expect( console ).toHaveErrored();
	} );

	it( 'should throw error if the prop type does not exist', () => {
		// Arrange.
		const value = {
			'key-1': { $$type: 'nested-key', value: 'nested-value' },
			'key-2': { $$type: 'nested-key', value: 'nested-value' },
		};

		// Act.
		expect( () => {
			renderHook( () => useBoundProp(), {
				wrapper: ( { children } ) => (
					// @ts-expect-error - empty propType for testing
					<PropProvider value={ value } setValue={ jest.fn() } propType={ null }>
						<PropKeyProvider bind="key-1">{ children }</PropKeyProvider>
					</PropProvider>
				),
			} );
		} ).toThrow( 'Prop type is missing' );

		// Suppress console.error from React.
		expect( console ).toHaveErrored();
	} );

	it( 'should return the nested object value by bind', () => {
		// Arrange.
		const nestedPropType = createMockPropType( { kind: 'plain' } );
		const nestedPropValue = { $$type: 'nested-key', value: 'nested-value' };

		const propType = createMockPropType( {
			kind: 'object',
			shape: {
				'key-1': nestedPropType,
				'key-2': createMockPropType( { kind: 'object' } ),
			},
		} );

		const value = {
			'key-1': nestedPropValue,
			'key-2': { $$type: 'nested-key', value: 'nested-value' },
		};

		// Act.
		const { result } = renderHook( () => useBoundProp(), {
			wrapper: ( { children } ) => (
				<PropProvider value={ value } setValue={ jest.fn() } propType={ propType }>
					<PropKeyProvider bind="key-1">{ children }</PropKeyProvider>
				</PropProvider>
			),
		} );

		// Assert.
		expect( result.current.bind ).toEqual( 'key-1' );
		expect( result.current.value ).toEqual( nestedPropValue );
		expect( result.current.propType ).toEqual( nestedPropType );
	} );

	it( 'should make inner prop accessible for nested children, with its bind path.', () => {
		// Arrange.
		const propType = createMockPropType( {
			kind: 'object',
			shape: {
				'key-1': createMockPropType( {
					kind: 'object',
					shape: {
						'key-2': createMockPropType( {
							kind: 'array',
							item_prop_type: createMockPropType( {
								kind: 'object',
								shape: {
									'key-3': createMockPropType( { kind: 'plain' } ),
								},
							} ),
						} ),
					},
				} ),
			},
		} );

		const value = {
			'key-1': {
				$$type: 'object-type',
				value: {
					'key-2': {
						$$type: 'array-type',
						value: [
							{
								$$type: 'nested-object-type',
								value: {
									'key-3': {
										$$type: 'nested-key',
										value: 'nested value',
									},
								},
							},
						],
					},
				},
			},
		};

		const setValue = jest.fn();

		const TopLevel = ( { children }: { children: React.ReactNode } ) => {
			return (
				<PropProvider propType={ propType } value={ value } setValue={ setValue }>
					<PropKeyProvider bind="key-1">{ children }</PropKeyProvider>
				</PropProvider>
			);
		};

		const Parent1 = ( { children }: { children: React.ReactNode } ) => {
			const propTypeUtil = createMockPropUtil( 'object-type', createMockSchema( 'object' ) );
			const context = useBoundProp( propTypeUtil );

			return (
				<PropProvider { ...context }>
					<PropKeyProvider bind="key-2">{ children }</PropKeyProvider>
				</PropProvider>
			);
		};

		const Parent2 = ( { children }: { children: React.ReactNode } ) => {
			const propTypeUtil = createMockPropUtil( 'array-type', createMockSchema( 'array' ) );
			const context = useBoundProp( propTypeUtil );

			return (
				<PropProvider { ...context }>
					<PropKeyProvider bind="0">{ children }</PropKeyProvider>
				</PropProvider>
			);
		};

		const Parent3 = ( { children }: { children: React.ReactNode } ) => {
			const propTypeUtil = createMockPropUtil( 'nested-object-type', createMockSchema( 'object' ) );
			const context = useBoundProp( propTypeUtil );

			return (
				<PropProvider { ...context }>
					<PropKeyProvider bind="key-3">{ children }</PropKeyProvider>
				</PropProvider>
			);
		};

		const Child = () => {
			const propTypeUtil = createMockPropUtil( 'nested-key', createMockSchema( 'string' ) );
			const propContext = useBoundProp( propTypeUtil );

			return (
				<div>
					<p>Path: { propContext.path.join( ' -> ' ) }</p>
					<input
						placeholder={ propContext.bind }
						value={ propContext.value as string }
						onChange={ ( e ) => propContext.setValue( e.target.value ) }
					/>
				</div>
			);
		};

		// Act.
		render(
			<TopLevel>
				<Parent1>
					<Parent2>
						<Parent3>
							<Child />
						</Parent3>
					</Parent2>
				</Parent1>
			</TopLevel>
		);

		// Assert.
		const input = screen.getByPlaceholderText( 'key-3' );
		expect( input ).toHaveValue( 'nested value' );
		expect( screen.getByText( `Path: key-1 -> key-2 -> 0 -> key-3` ) );

		// Act.
		fireEvent.change( input, { target: { value: 'new value' } } );

		// Assert.
		const expectedNewValue = structuredClone( value );
		expectedNewValue[ 'key-1' ].value[ 'key-2' ].value[ 0 ].value[ 'key-3' ].value = 'new value';

		expect( setValue ).toHaveBeenCalledWith( expectedNewValue, {}, { bind: 'key-1' } );
	} );

	it( 'should call the prop provider setValue with its value and created options', () => {
		// Arrange.
		const nestedPropType = createMockPropType( { kind: 'plain' } );
		const nestedPropValue = { $$type: 'nested-key', value: 'nested-value' };

		const propType = createMockPropType( {
			kind: 'object',
			shape: {
				'key-1': nestedPropType,
				'key-2': createMockPropType( { kind: 'object' } ),
			},
		} );

		const value = {
			'key-1': nestedPropValue,
			'key-2': { $$type: 'nested-key', value: 'nested-value' },
		};

		const parentPropSetValue = jest.fn();

		const propTypeUtil = createMockPropUtil( 'nested-key', createMockSchema( 'string' ) );

		const { result } = renderHook( () => useBoundProp( propTypeUtil ), {
			wrapper: ( { children } ) => (
				<PropProvider value={ value } setValue={ parentPropSetValue } propType={ propType }>
					<PropKeyProvider bind="key-1">{ children }</PropKeyProvider>
				</PropProvider>
			),
		} );

		// Act.
		result.current.setValue( 'new value', { disabled: true } );

		// Assert.
		expect( parentPropSetValue ).toHaveBeenCalledWith(
			{
				'key-1': { $$type: 'nested-key', value: 'new value', disabled: true },
				'key-2': { $$type: 'nested-key', value: 'nested-value' },
			},
			// the create options are merged, and should not be passed to the parent
			{},
			{ bind: 'key-1' }
		);
	} );

	it.each( [ { kind: 'plain' }, { kind: 'union' } ] )(
		'should throw error if PropKeyProvider is rendered inside $kind prop provider',
		( { kind } ) => {
			// Arrange.
			const propType = createMockPropType( { kind } as never ) as PropType;
			const value = {
				'key-2': { $$type: 'nested-key', value: 'nested-value' },
			};

			// Act & Assert.
			expect( () => {
				render(
					<PropProvider value={ value } setValue={ jest.fn() } propType={ propType }>
						<PropKeyProvider bind="key"></PropKeyProvider>
					</PropProvider>
				);
			} ).toThrow( 'Parent prop type is not supported' );

			// Suppress console.error from React.
			expect( console ).toHaveErrored();
		}
	);

	it( 'should not set empty value when the prop type is required', () => {
		// Arrange.
		const propType = createMockPropType( {
			kind: 'object',
			shape: {
				key: createMockPropType( {
					kind: 'plain',
					settings: {
						required: true,
					},
				} ),
			},
		} );

		const value = {
			key: stringPropTypeUtil.create( '123' ),
		};

		const setValue = jest.fn();

		// Act.
		const { result } = renderHook( () => useBoundProp( stringPropTypeUtil ), {
			wrapper: ( { children } ) => (
				<PropProvider value={ value } setValue={ setValue } propType={ propType }>
					<PropKeyProvider bind="key">{ children }</PropKeyProvider>
				</PropProvider>
			),
		} );

		// Assert.
		expect( result.current.value ).toBe( '123' );

		// Act.
		act( () => {
			result.current.setValue( null );
		} );

		// Assert.
		expect( setValue ).not.toHaveBeenCalled();
		expect( result.current.value ).toBe( null );

		// Act.
		act( () => {
			result.current.restoreValue();
		} );

		// Assert.
		expect( result.current.value ).toBe( '123' );
	} );

	it( 'should reset the valid state if the new value is valid', () => {
		// Arrange.
		const propType = createMockPropType( {
			kind: 'object',
			shape: {
				key: createMockPropType( {
					kind: 'plain',
					settings: {
						required: true,
					},
				} ),
			},
		} );

		let value = {
			key: stringPropTypeUtil.create( '123' ),
		};

		const setValue = ( newValue: typeof value ) => {
			value = newValue;
		};

		// Act.
		const { result, rerender } = renderHook( () => useBoundProp( stringPropTypeUtil ), {
			wrapper: ( { children } ) => (
				<PropProvider value={ value } setValue={ setValue } propType={ propType }>
					<PropKeyProvider bind="key">{ children }</PropKeyProvider>
				</PropProvider>
			),
		} );

		// Assert.
		expect( result.current.value ).toBe( '123' );

		// Act.
		act( () => {
			result.current.setValue( null );
		} );

		// Assert.
		expect( result.current.value ).toBe( null );

		// Act.
		act( () => {
			result.current.setValue( 'abc' );
		} );

		rerender();

		// Assert.
		expect( result.current.value ).toBe( 'abc' );
	} );
} );
