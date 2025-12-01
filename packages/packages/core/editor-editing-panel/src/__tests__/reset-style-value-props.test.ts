import { createMockPropType } from 'test-utils';
import { useBoundProp } from '@elementor/editor-controls';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { renderHook } from '@testing-library/react';

import { useIsStyle } from '../contexts/style-context';
import { useResetStyleValueProps } from '../reset-style-props';

jest.mock( '@elementor/editor-v1-adapters' );
jest.mock( '@elementor/editor-controls' );
jest.mock( '../contexts/style-context' );
jest.mock( '@elementor/editor-styles-repository' );

describe( 'Reset Style Props Tests', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		( isExperimentActive as jest.Mock ).mockReturnValue( false );
		( useIsStyle as jest.Mock ).mockReturnValue( false );
		( useBoundProp as jest.Mock ).mockReturnValue( {
			value: null,
			setValue: jest.fn(),
			path: [],
			bind: '',
			propType: createMockPropType(),
		} );
	} );

	describe( 'when not in style context', () => {
		it( 'should not enable reset-value action', () => {
			( useIsStyle as jest.Mock ).mockReturnValue( false );

			const { result } = renderHook( () => useResetStyleValueProps() );

			expect( result.current.visible ).toBe( false );
		} );
	} );

	describe( 'when in style context', () => {
		beforeEach( () => {
			( useIsStyle as jest.Mock ).mockReturnValue( true );
		} );

		it( 'should show reset button when style value is present', () => {
			( useBoundProp as jest.Mock ).mockReturnValue( {
				value: 'some-style-value',
				setValue: jest.fn(),
				path: [ 'style', 'color' ],
				bind: 'color',
				propType: createMockPropType(),
			} );

			const { result } = renderHook( () => useResetStyleValueProps() );

			expect( result.current.visible ).toBe( true );
		} );

		it( 'should reset style value to null when clicked', () => {
			const resetValueMock = jest.fn();
			( useBoundProp as jest.Mock ).mockReturnValue( {
				value: 'some-style-value',
				resetValue: resetValueMock,
				path: [ 'style', 'color' ],
				bind: 'color',
				propType: createMockPropType(),
			} );

			const { result } = renderHook( () => useResetStyleValueProps() );

			result.current.onClick();

			expect( resetValueMock ).toHaveBeenCalled();
		} );

		// should also reset to initial value
		it( 'should not show reset button when value is null', () => {
			( useBoundProp as jest.Mock ).mockReturnValue( {
				value: null,
				setValue: jest.fn(),
				path: [ 'style', 'color' ],
				bind: 'color',
				propType: createMockPropType(),
			} );

			const { result } = renderHook( () => useResetStyleValueProps() );

			expect( result.current.visible ).toBe( false );
		} );

		it( 'should not show reset button when value is undefined', () => {
			( useBoundProp as jest.Mock ).mockReturnValue( {
				value: undefined,
				setValue: jest.fn(),
				path: [ 'style', 'color' ],
				bind: 'color',
				propType: createMockPropType(),
			} );

			const { result } = renderHook( () => useResetStyleValueProps() );

			expect( result.current.visible ).toBe( false );
		} );

		it( 'should show reset when inside repeater', () => {
			( useBoundProp as jest.Mock ).mockReturnValue( {
				value: 'bg-value',
				resetValue: jest.fn(),
				path: [ 'background-overlay', '0', 'color' ],
				bind: 'color',
				propType: { settings: { required: false } },
			} );

			const { result } = renderHook( () => useResetStyleValueProps() );

			expect( result.current.visible ).toBe( true );
		} );

		it( 'should not show reset when prop is required and initial value is null', () => {
			( useBoundProp as jest.Mock ).mockReturnValue( {
				value: 'some-style-value',
				resetValue: jest.fn(),
				path: [ 'background', '1', 'move' ],
				bind: 'color',
				propType: createMockPropType( { kind: 'plain', settings: { required: true } } ),
			} );

			const { result } = renderHook( () => useResetStyleValueProps() );

			expect( result.current.visible ).toBe( false );
		} );

		it( 'should show reset button for transition duration control (size)', () => {
			( useBoundProp as jest.Mock ).mockReturnValue( {
				value: { size: 300, unit: 'ms' },
				resetValue: jest.fn(),
				path: [ 'transition', '0', 'size' ],
				bind: 'size',
				propType: createMockPropType(),
			} );

			const { result } = renderHook( () => useResetStyleValueProps() );

			expect( result.current.visible ).toBe( true );
		} );

		it( 'should not show reset button for transition type control (selector)', () => {
			( useBoundProp as jest.Mock ).mockReturnValue( {
				value: {
					$$type: 'key-value',
					value: {
						key: {
							$$type: 'string',
							value: 'Margin left',
						},
						value: {
							value: 'margin-inline-start',
							$$type: 'string',
						},
					},
				},
				resetValue: jest.fn(),
				path: [ 'transition', '0', 'selection' ],
				bind: 'selection',
				propType: createMockPropType(),

			} );
			const { result } = renderHook( () => useResetStyleValueProps() );
			expect( result.current.visible ).toBe( false );
		} );

		it( 'should not show reset button when value equals initial_value', () => {
			( useBoundProp as jest.Mock ).mockReturnValue( {
				value: {
					$$type: 'size',
					value: {
						size: 89,
						unit: 'rem',
					},
				},
				resetValue: jest.fn(),
				path: [ 'background', '0', 'color' ],
				bind: 'color',
				propType: {
					initial_value: {
						$$type: 'size',
						value: {
							size: 89,
							unit: 'rem',
						},
					},
					settings: { required: false },
				},
			} );

			const { result } = renderHook( () => useResetStyleValueProps() );

			expect( result.current.visible ).toBe( false );
		} );

		it( 'should show reset button when value differs from initial_value', () => {
			( useBoundProp as jest.Mock ).mockReturnValue( {
				value: {
					$$type: 'string',
					value: 'string value',
				},
				resetValue: jest.fn(),
				path: [ 'background', '0', 'color' ],
				bind: 'color',
				propType: {
					initial_value: {
						$$type: 'string',
						value: 'initial value',
					},
					settings: { required: false },
				},
			} );

			const { result } = renderHook( () => useResetStyleValueProps() );

			expect( result.current.visible ).toBe( true );
		} );

		it( 'should handle array values comparison with initial_value', () => {
			( useBoundProp as jest.Mock ).mockReturnValue( {
				value: [ 'value1', 'value2' ],
				resetValue: jest.fn(),
				path: [ 'background', '0', 'colors' ],
				bind: 'colors',
				propType: {
					initial_value: [ 'value1', 'value3' ],
					settings: { required: false },
				},
			} );

			const { result } = renderHook( () => useResetStyleValueProps() );

			expect( result.current.visible ).toBe( true );
		} );

		it( 'should not show reset when in repeater without initial value and has required', () => {
			( useBoundProp as jest.Mock ).mockReturnValue( {
				value: 'some-value-to-reset',
				resetValue: jest.fn(),
				path: [ 'background', '0', 'color' ],
				bind: 'color',
				propType: createMockPropType( {
					kind: 'plain',
					settings: { required: true },
				} ),
			} );

			const { result } = renderHook( () => useResetStyleValueProps() );

			expect( result.current.visible ).toBe( false );
		} );
	} );
} );
