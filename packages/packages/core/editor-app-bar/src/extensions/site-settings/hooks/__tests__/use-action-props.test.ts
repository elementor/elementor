import {
	__privateRunCommand as runCommand,
	__privateUseRouteStatus as useRouteStatus,
} from '@elementor/editor-v1-adapters';
import { renderHook } from '@testing-library/react';

import useActionProps from '../use-action-props';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateRunCommand: jest.fn(),
	__privateUseRouteStatus: jest.fn(),
} ) );

describe( '@elementor/editor-app-bar - site-settings - useActionProps', () => {
	it.each( [
		{
			action: 'open',
			input: { isActive: false, isBlocked: false },
			expectedCommand: 'panel/global/open',
		},
		{
			action: 'close',
			input: { isActive: true, isBlocked: false },
			expectedCommand: 'panel/global/close',
		},
	] )( 'should $action the site-settings panel on click', ( { input, expectedCommand } ) => {
		// Arrange.
		jest.mocked( useRouteStatus ).mockImplementation( () => input );

		const { result } = renderHook( () => useActionProps() );

		// Act.
		result.current.onClick?.();

		// Assert.
		expect( runCommand ).toHaveBeenCalledTimes( 1 );
		expect( runCommand ).toHaveBeenCalledWith( expectedCommand );
	} );

	it( 'should have the correct props for disabled and selected', () => {
		// Arrange.
		jest.mocked( useRouteStatus ).mockImplementation( () => ( { isActive: true, isBlocked: true } ) );

		// Act.
		const { result } = renderHook( () => useActionProps() );

		// Assert.
		expect( result.current.selected ).toBe( true );
		expect( result.current.disabled ).toBe( true );
		expect( useRouteStatus ).toHaveBeenCalledTimes( 1 );
		expect( useRouteStatus ).toHaveBeenCalledWith( 'panel/global', { blockOnKitRoutes: false } );
	} );
} );
