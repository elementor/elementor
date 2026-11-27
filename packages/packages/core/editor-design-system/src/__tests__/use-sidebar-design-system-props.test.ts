import { useIsLegacyElementsPanelSelected } from '@elementor/editor-elements-panel';
import { renderHook } from '@testing-library/react';

import { useOpenDesignSystemToolbar } from '../use-open-design-system-toolbar';
import { useSidebarDesignSystemProps } from '../use-sidebar-design-system-props';

jest.mock( '@elementor/editor-elements-panel', () => ( {
	useIsLegacyElementsPanelSelected: jest.fn(),
} ) );

jest.mock( '../use-open-design-system-toolbar', () => ( {
	useOpenDesignSystemToolbar: jest.fn(),
} ) );

describe( 'useSidebarDesignSystemProps', () => {
	const onClick = jest.fn();

	const mockToolbar = ( selected: boolean ) => {
		jest.mocked( useOpenDesignSystemToolbar ).mockReturnValue( {
			title: 'Design System',
			icon: () => null,
			onClick,
			selected,
		} as ReturnType< typeof useOpenDesignSystemToolbar > );
	};

	it.each( [
		[ 'Legacy + closed', true, false, true ],
		[ 'Legacy + open', true, true, false ],
		[ 'Atomic + closed', false, false, false ],
		[ 'Atomic + open', false, true, false ],
	] )( 'should compute disabled for %s', ( _label, isLegacy, isOpen, expected ) => {
		// Arrange.
		mockToolbar( isOpen );
		jest.mocked( useIsLegacyElementsPanelSelected ).mockReturnValue( isLegacy );

		// Act.
		const { result } = renderHook( () => useSidebarDesignSystemProps() );

		// Assert.
		expect( result.current.disabled ).toBe( expected );
	} );

	it( 'should keep selected/onClick from the toolbar hook and not be exclusive', () => {
		// Arrange.
		mockToolbar( true );
		jest.mocked( useIsLegacyElementsPanelSelected ).mockReturnValue( false );

		// Act.
		const { result } = renderHook( () => useSidebarDesignSystemProps() );

		// Assert.
		expect( result.current.selected ).toBe( true );
		expect( result.current.onClick ).toBe( onClick );
		expect( result.current ).not.toHaveProperty( 'exclusive' );
	} );
} );
