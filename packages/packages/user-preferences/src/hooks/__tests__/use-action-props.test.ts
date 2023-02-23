import { renderHook } from '@testing-library/react-hooks';
import useActionProps from '../use-action-props';
import { openRoute } from '@elementor/v1-adapters';

jest.mock( '@elementor/v1-adapters', () => ( {
	openRoute: jest.fn(),
} ) );

describe( '@elementor/user-preferences - useActionProps', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

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
} );
