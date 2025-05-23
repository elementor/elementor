import { renderHook } from '@testing-library/react-hooks';
import useKeyboardShortcutsActionProps from '../use-keyboard-shortcuts-action-props';
import { runCommand } from '@elementor/v1-adapters';

jest.mock( '@elementor/v1-adapters', () => ( {
	runCommand: jest.fn(),
} ) );

describe( '@elementor/help - useKeyboardShortcutsActionProps', () => {
	it( 'should open the keyboard shortcuts modal on click', () => {
		// Act.
		const { result } = renderHook( () => useKeyboardShortcutsActionProps() );

		result.current.onClick?.();

		// Assert.
		expect( runCommand ).toHaveBeenCalledTimes( 1 );
		expect( runCommand ).toHaveBeenCalledWith( 'shortcuts/open' );
	} );
} );
