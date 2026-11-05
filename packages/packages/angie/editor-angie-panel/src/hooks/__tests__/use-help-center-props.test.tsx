import { openAngie } from '@elementor/editor-angie';
import { renderHook } from '@testing-library/react';

import { useHelpCenterProps } from '../use-help-center-props';

jest.mock( '@elementor/editor-angie', () => ( {
	openAngie: jest.fn(),
	AngieInteractionMode: {
		ASK: 'ask',
	},
} ) );

describe( 'useHelpCenterProps', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'opens Angie through the single editor function', () => {
		const { result } = renderHook( () => useHelpCenterProps() );
		const preventDefault = jest.fn();

		result.current.onClick( { preventDefault } as unknown as React.MouseEvent );

		expect( preventDefault ).toHaveBeenCalled();
		expect( openAngie ).toHaveBeenCalledWith( {
			prompt: 'Help me with ',
			mode: 'ask',
		} );
	} );
} );
