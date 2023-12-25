import { runCommand } from '@elementor/v1-adapters';
import { renderHook } from '@testing-library/react-hooks';
import useBreakpointsActions from '../use-breakpoints-actions';

jest.mock( '@elementor/v1-adapters', () => ( {
	runCommand: jest.fn(),
} ) );

describe( '@elementor/responsive - useBreakpointsActions', () => {
	it( 'should activate a breakpoint', () => {
		// Act.
		const { result } = renderHook( () => useBreakpointsActions() );

		result.current.activate( 'tablet' );

		// Assert.
		expect( jest.mocked( runCommand ) ).toHaveBeenCalledTimes( 1 );
		expect( jest.mocked( runCommand ) ).toHaveBeenCalledWith(
			'panel/change-device-mode',
			{ device: 'tablet' }
		);
	} );
} );
