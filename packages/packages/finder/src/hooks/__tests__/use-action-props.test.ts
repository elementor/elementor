import useActionProps from '../use-action-props';
import { renderHook } from '@testing-library/react-hooks';
import { runCommand, useRouteStatus } from '@elementor/v1-adapters';

jest.mock( '@elementor/v1-adapters', () => ( {
	runCommand: jest.fn(),
	useRouteStatus: jest.fn( () => ( { isActive: true, isBlocked: true } ) ),
} ) );

describe( '@elementor/finder - useActionProps', () => {
	it( 'should toggle the finder state on click', () => {
		// Arrange.
		const { result } = renderHook( () => useActionProps() );

		// Act.
		result.current.onClick();

		// Assert.
		expect( runCommand ).toHaveBeenCalledTimes( 1 );
		expect( runCommand ).toHaveBeenCalledWith( 'finder/toggle' );
	} );

	it( 'should have the correct props for disabled and selected', () => {
		// Act.
		const { result } = renderHook( () => useActionProps() );

		// Assert.
		expect( result.current.selected ).toBe( true );
		expect( result.current.disabled ).toBe( true );
		expect( useRouteStatus ).toHaveBeenCalledTimes( 1 );
		expect( useRouteStatus ).toHaveBeenCalledWith( 'finder', {
			blockOnKitRoutes: false,
			blockOnPreviewMode: false,
		} );
	} );
} );
