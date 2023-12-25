import useActionProps from '../use-action-props';
import { renderHook } from '@testing-library/react-hooks';
import { runCommand, useRouteStatus } from '@elementor/v1-adapters';

jest.mock( '@elementor/v1-adapters', () => ( {
	runCommand: jest.fn(),
	useRouteStatus: jest.fn(),
} ) );

describe( '@elementor/site-settings - useActionProps', () => {
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
