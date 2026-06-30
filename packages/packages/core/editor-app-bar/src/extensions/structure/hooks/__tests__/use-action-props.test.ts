import {
	__privateRunCommand as runCommand,
	__privateUseRouteStatus as useRouteStatus,
} from '@elementor/editor-v1-adapters';
import { renderHook } from '@testing-library/react';

import useActionProps from '../use-action-props';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateRunCommand: jest.fn(),
	__privateUseRouteStatus: jest.fn( () => ( { isActive: true, isBlocked: true } ) ),
} ) );

describe( '@elementor/editor-app-bar - useStructureActionProps', () => {
	it( 'should toggle the navigator state when clicked', () => {
		// Arrange.
		const { result } = renderHook( () => useActionProps() );

		// Act.
		result.current.onClick?.();

		// Assert.
		expect( runCommand ).toHaveBeenCalledTimes( 1 );
		expect( runCommand ).toHaveBeenCalledWith( 'navigator/toggle' );
	} );

	it( 'should have the correct props for disabled and selected', () => {
		// Act.
		const { result } = renderHook( () => useActionProps() );

		// Assert.
		expect( result.current.selected ).toBe( true );
		expect( result.current.disabled ).toBe( true );
		expect( useRouteStatus ).toHaveBeenCalledTimes( 1 );
		expect( useRouteStatus ).toHaveBeenCalledWith( 'navigator' );
	} );
} );
