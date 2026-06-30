import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { renderHook } from '@testing-library/react';

import useThemeBuilderActionProps from '../use-action-props';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateRunCommand: jest.fn(),
} ) );

describe( '@elementor/editor-app-bar - useThemeBuilderActionProps', () => {
	it( 'should open the theme builder', () => {
		// Arrange.
		const command = 'app/open';

		// Act.
		const { result } = renderHook( () => useThemeBuilderActionProps() );
		result.current.onClick?.();

		// Assert.
		expect( runCommand ).toBeCalledTimes( 1 );
		expect( runCommand ).toHaveBeenCalledWith( command );
	} );
} );
