import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { renderHook } from '@testing-library/react';

import { useActivateBreakpoint } from '../use-activate-breakpoint';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateRunCommand: jest.fn(),
} ) );

describe( 'useActivateBreakpoints', () => {
	it( 'should activate a breakpoint', () => {
		// Act.
		const { result } = renderHook( useActivateBreakpoint );

		result.current( 'tablet' );

		// Assert.
		expect( jest.mocked( runCommand ) ).toHaveBeenCalledTimes( 1 );
		expect( jest.mocked( runCommand ) ).toHaveBeenCalledWith( 'panel/change-device-mode', { device: 'tablet' } );
	} );
} );
