import { renderHook } from '@testing-library/react';

import useActionProps from '../use-action-props';

const mockIsAngieAvailable = jest.fn();
const mockOpenAngieInAskMode = jest.fn();

jest.mock( '@elementor/editor-mcp', () => ( {
	isAngieAvailable: () => mockIsAngieAvailable(),
	openAngieInAskMode: () => mockOpenAngieInAskMode(),
} ) );

describe( 'useHelpCenterActionProps', () => {
	beforeEach( () => {
		mockIsAngieAvailable.mockReset();
		mockOpenAngieInAskMode.mockReset();
		window.elementorCommon = {
			eventsManager: {
				dispatchEvent: jest.fn(),
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
		expect( mockOpenAngieInAskMode ).toHaveBeenCalled();
		expect( result.current.href ).toBeUndefined();
		expect( result.current.target ).toBeUndefined();
	} );
} );
