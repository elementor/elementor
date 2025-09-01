import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { renderHook } from '@testing-library/react';

import useActionProps from '../use-action-props';

jest.mock( '@elementor/editor-v1-adapters' );

describe( 'useFinderActionProps', () => {
	it( 'should toggle the finder state on click', () => {
		// Arrange.
		const { result } = renderHook( () => useActionProps() );

		// Act.
		result.current.onClick();

		// Assert.
		expect( runCommand ).toHaveBeenCalledTimes( 1 );
		expect( runCommand ).toHaveBeenCalledWith( 'finder/toggle' );
	} );
} );
