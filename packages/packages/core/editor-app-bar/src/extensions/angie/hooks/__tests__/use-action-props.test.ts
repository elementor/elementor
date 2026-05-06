import { renderHook } from '@testing-library/react';

import useActionProps from '../use-action-props';

const mockIsAngieAvailable = jest.fn();

jest.mock( '@elementor/editor-mcp', () => ( {
	isAngieAvailable: () => mockIsAngieAvailable(),
} ) );

describe( 'useAngieActionProps', () => {
	beforeEach( () => {
		mockIsAngieAvailable.mockReset();
	} );

	it( 'should be visible when Angie is not available', () => {
		mockIsAngieAvailable.mockReturnValue( false );

		const { result } = renderHook( () => useActionProps() );

		expect( result.current.visible ).toBe( true );
	} );

	it( 'should not be visible when Angie is available', () => {
		mockIsAngieAvailable.mockReturnValue( true );

		const { result } = renderHook( () => useActionProps() );

		expect( result.current.visible ).toBe( false );
	} );

	it( 'should dispatch create-widget with prompt and top_bar entry point', () => {
		mockIsAngieAvailable.mockReturnValue( false );
		const dispatchSpy = jest.spyOn( window, 'dispatchEvent' );

		const { result } = renderHook( () => useActionProps() );
		result.current.onClick();

		expect( dispatchSpy ).toHaveBeenCalledTimes( 1 );
		const event = dispatchSpy.mock.calls[ 0 ][ 0 ] as CustomEvent;
		expect( event.type ).toBe( 'elementor/editor/create-widget' );
		expect( event.detail ).toMatchObject( {
			entry_point: 'top_bar',
			prompt: expect.stringContaining( 'Create a widget for me.' ),
		} );

		dispatchSpy.mockRestore();
	} );
} );
