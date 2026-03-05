import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';
import { renderHook } from '@testing-library/react';

import useActionProps from '../use-action-props';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateRunCommand: jest.fn(),
} ) );

describe( '@elementor/editor-app-bar - useKeyboardShortcutsActionProps', () => {
	it( 'should open the keyboard shortcuts modal on click', () => {
		// Act.
		const { result } = renderHook( () => useActionProps() );

		result.current.onClick?.();

		// Assert.
		expect( runCommand ).toHaveBeenCalledTimes( 1 );
		expect( runCommand ).toHaveBeenCalledWith( 'shortcuts/open' );
	} );
} );
