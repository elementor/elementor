import { renderHook } from '@testing-library/react';

import useActionProps from '../use-action-props';

const mockIsAngieAvailable = jest.fn();
const mockTrackEvent = jest.fn();

jest.mock( '@elementor/editor-mcp', () => ( {
	isAngieAvailable: () => mockIsAngieAvailable(),
} ) );

jest.mock( '@elementor/events', () => ( {
	trackEvent: ( ...args: unknown[] ) => mockTrackEvent( ...args ),
} ) );

describe( 'useAngieActionProps', () => {
	beforeEach( () => {
		mockIsAngieAvailable.mockReset();
		mockTrackEvent.mockReset();
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

	it( 'should dispatch create-widget with prompt and top_bar_icon entry point', () => {
		mockIsAngieAvailable.mockReturnValue( false );
		const dispatchSpy = jest.spyOn( window, 'dispatchEvent' );

		const { result } = renderHook( () => useActionProps() );
		result.current.onClick();

		expect( dispatchSpy ).toHaveBeenCalledTimes( 1 );
		const event = dispatchSpy.mock.calls[ 0 ][ 0 ] as CustomEvent;
		expect( event.type ).toBe( 'elementor/editor/create-widget' );
		expect( event.detail ).toMatchObject( {
			entry_point: 'top_bar_icon',
			prompt: expect.stringContaining( 'Create a widget for me.' ),
		} );

		dispatchSpy.mockRestore();
	} );

	it( 'should fire ai_widget_cta_viewed on render when Angie is not installed', () => {
		mockIsAngieAvailable.mockReturnValue( false );

		renderHook( () => useActionProps() );

		expect( mockTrackEvent ).toHaveBeenCalledWith( {
			eventName: 'ai_widget_cta_viewed',
			entry_point: 'top_bar_icon',
			has_angie_installed: false,
		} );
	} );

	it( 'should not fire ai_widget_cta_viewed when Angie is installed', () => {
		mockIsAngieAvailable.mockReturnValue( true );

		renderHook( () => useActionProps() );

		expect( mockTrackEvent ).not.toHaveBeenCalled();
	} );
} );
