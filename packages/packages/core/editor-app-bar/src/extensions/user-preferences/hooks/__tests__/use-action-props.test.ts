import {
	__privateOpenRoute as openRoute,
	__privateUseRouteStatus as useRouteStatus,
} from '@elementor/editor-v1-adapters';
import { renderHook } from '@testing-library/react';

import useActionProps from '../use-action-props';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateOpenRoute: jest.fn(),
	__privateUseRouteStatus: jest.fn( () => ( { isActive: true, isBlocked: true } ) ),
} ) );

describe( '@elementor/editor-app-bar - useUserPreferencesActionProps', () => {
	it( 'should open the user preferences', () => {
		// Arrange.
		const route = 'panel/editor-preferences';

		// Act.
		const { result } = renderHook( () => useActionProps() );
		result.current.onClick?.();

		// Assert.
		expect( openRoute ).toHaveBeenCalledTimes( 1 );
		expect( openRoute ).toHaveBeenCalledWith( route );
	} );

	it( 'should have the correct props for disabled and selected', () => {
		// Act.
		const { result } = renderHook( () => useActionProps() );

		// Assert.
		expect( result.current.selected ).toBe( true );
		expect( result.current.disabled ).toBe( true );
		expect( useRouteStatus ).toHaveBeenCalledTimes( 1 );
		expect( useRouteStatus ).toHaveBeenCalledWith( 'panel/editor-preferences' );
	} );
} );
