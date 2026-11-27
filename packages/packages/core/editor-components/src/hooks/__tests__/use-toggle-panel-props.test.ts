import { useIsLegacyElementsPanelSelected } from '@elementor/editor-elements-panel';
import { renderHook } from '@testing-library/react';

import { usePanelActions, usePanelStatus } from '../../components/components-panel/panel';
import { useTogglePanelProps } from '../use-toggle-panel-props';

jest.mock( '@elementor/editor-elements-panel', () => ( {
	useIsLegacyElementsPanelSelected: jest.fn(),
} ) );

jest.mock( '../../components/components-panel/panel', () => ( {
	usePanelStatus: jest.fn(),
	usePanelActions: jest.fn(),
} ) );

describe( 'useTogglePanelProps', () => {
	const open = jest.fn();
	const close = jest.fn();

	beforeEach( () => {
		jest.mocked( usePanelActions ).mockReturnValue( { open, close } as never );
	} );

	it.each( [
		[ false, false, false ],
		[ true, false, true ],
		[ false, true, true ],
		[ true, true, true ],
	] )( 'should compute disabled for isBlocked=%s isLegacy=%s', ( isBlocked, isLegacy, expected ) => {
		// Arrange.
		jest.mocked( usePanelStatus ).mockReturnValue( { isOpen: false, isBlocked } as never );
		jest.mocked( useIsLegacyElementsPanelSelected ).mockReturnValue( isLegacy );

		// Act.
		const { result } = renderHook( () => useTogglePanelProps() );

		// Assert.
		expect( result.current.disabled ).toBe( expected );
		expect( result.current ).not.toHaveProperty( 'exclusive' );
	} );
} );
