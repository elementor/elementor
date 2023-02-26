import { renderHook } from '@testing-library/react-hooks';
import useActionProps from '../use-action-props';
import { runCommand } from '@elementor/v1-adapters';

jest.mock( '@elementor/v1-adapters', () => ( {
	runCommand: jest.fn(),
} ) );

describe( '@elementor/theme-builder - useActionProps', () => {
	it( 'should open the theme builder', () => {
		// Arrange.
		const command = 'app/open';

		// Act.
		const { result } = renderHook( () => useActionProps() );
		result.current.onClick?.();

		// Assert.
		expect( runCommand ).toBeCalledTimes( 1 );
		expect( runCommand ).toHaveBeenCalledWith( command );
	} );
} );
