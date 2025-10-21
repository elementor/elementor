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
			} );

			const { result } = renderHook( () => useResetStyleValueProps() );

			result.current.onClick();

			expect( resetValueMock ).toHaveBeenCalled();
		} );

		it( 'should not show reset button when value is null or undefined', () => {
			( useBoundProp as jest.Mock ).mockReturnValue( {
				value: null,
				setValue: jest.fn(),
				path: [ 'style', 'color' ],
				bind: 'color',
			} );

			const { result } = renderHook( () => useResetStyleValueProps() );

			expect( result.current.visible ).toBe( false );
		} );

		it.skip( 'should not show reset button for excluded binds', () => {
			// TODO: Fix me!
			( useBoundProp as jest.Mock ).mockReturnValue( {
				value: 'some-value',
				setValue: jest.fn(),
				path: [ 'style' ],
				bind: 'flex-grow',
			} );

			const { result } = renderHook( () => useResetStyleValueProps() );

			expect( result.current.visible ).toBe( false );
		} );

		it( 'should not show reset button when path is part of repeater', () => {
			( useBoundProp as jest.Mock ).mockReturnValue( {
				value: 'some-value',
				setValue: jest.fn(),
				path: [ 'style', 'color', '2', 'deep' ],
				bind: 'color',
			} );

			const { result } = renderHook( () => useResetStyleValueProps() );

			expect( result.current.visible ).toBe( false );
		} );

		it( 'should show reset when inside supported repeater (background)', () => {
			( useBoundProp as jest.Mock ).mockReturnValue( {
				value: 'bg-value',
				resetValue: jest.fn(),
				path: [ 'background', '0', 'color' ],
				bind: 'color',
				propType: { settings: { required: false } },
			} );

			const { result } = renderHook( () => useResetStyleValueProps() );

			expect( result.current.visible ).toBe( true );
		} );

		it( 'should not show reset when prop is required', () => {
			( useBoundProp as jest.Mock ).mockReturnValue( {
				value: 'some-style-value',
				resetValue: jest.fn(),
				path: [ 'style', 'color' ],
				bind: 'color',
				propType: { settings: { required: true } },
			} );

			const { result } = renderHook( () => useResetStyleValueProps() );

			expect( result.current.visible ).toBe( false );
		} );
	} );
} );
