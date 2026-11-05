import { renderHook } from '@testing-library/react';

import useActionProps from '../use-action-props';

const mockIsAngieAvailable = jest.fn();
const mockOpenAngieInAskMode = jest.fn();
const mockHasLoadedEditorAngie = jest.fn();
const mockOpenLoadedEditorAngie = jest.fn();

jest.mock( '@elementor/editor-mcp', () => ( {
	isAngieAvailable: () => mockIsAngieAvailable(),
	openAngieInAskMode: ( ...args: unknown[] ) => mockOpenAngieInAskMode( ...args ),
	hasLoadedEditorAngie: () => mockHasLoadedEditorAngie(),
	openLoadedEditorAngie: ( ...args: unknown[] ) => mockOpenLoadedEditorAngie( ...args ),
} ) );

describe( 'useHelpCenterActionProps', () => {
	let mockDispatchEvent: jest.Mock;

	beforeEach( () => {
		mockIsAngieAvailable.mockReset();
		mockOpenAngieInAskMode.mockReset();
		mockHasLoadedEditorAngie.mockReset();
		mockOpenLoadedEditorAngie.mockReset();
		mockHasLoadedEditorAngie.mockReturnValue( false );
		mockDispatchEvent = jest.fn();
		window.elementorCommon = {
			eventsManager: {
				dispatchEvent: mockDispatchEvent,
				config: {
					names: {
						topBar: {
							help: 'top_bar_help',
						},
					},
					locations: {
						topBar: 'Top Bar',
					},
					secondaryLocations: {
						help: 'Help',
					},
					triggers: {
						click: 'click',
					},
					elements: {
						buttonIcon: 'button_icon',
					},
				},
			},
		} as unknown as typeof window.elementorCommon;
	} );

	it( 'opens the editor Angie package when it is loaded', () => {
		mockHasLoadedEditorAngie.mockReturnValue( true );
		mockIsAngieAvailable.mockReturnValue( false );

		const { result } = renderHook( () => useActionProps() );
		const preventDefault = jest.fn();

		result.current.onClick?.( { preventDefault } as unknown as React.MouseEvent );

		expect( preventDefault ).toHaveBeenCalled();
		expect( mockDispatchEvent ).toHaveBeenCalled();
		expect( mockOpenLoadedEditorAngie ).toHaveBeenCalledWith( 'Help me with ' );
		expect( mockOpenAngieInAskMode ).not.toHaveBeenCalled();
		expect( result.current.href ).toBeUndefined();
	} );

	it( 'returns an external link when Angie is inactive', () => {
		mockIsAngieAvailable.mockReturnValue( false );

		const { result } = renderHook( () => useActionProps() );

		expect( result.current.href ).toBe( 'https://go.elementor.com/editor-top-bar-learn/' );
		expect( result.current.target ).toBe( '_blank' );
	} );

	it( 'opens Angie in ask mode when Angie is active', () => {
		mockIsAngieAvailable.mockReturnValue( true );

		const { result } = renderHook( () => useActionProps() );
		const preventDefault = jest.fn();

		result.current.onClick?.( { preventDefault } as unknown as React.MouseEvent );

		expect( preventDefault ).toHaveBeenCalled();
		expect( mockDispatchEvent ).toHaveBeenCalled();
		expect( mockOpenAngieInAskMode ).toHaveBeenCalledWith( 'Help me with ' );
		expect( result.current.href ).toBeUndefined();
		expect( result.current.target ).toBeUndefined();
	} );
} );
