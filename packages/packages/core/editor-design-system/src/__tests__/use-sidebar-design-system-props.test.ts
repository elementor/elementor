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

	beforeEach( () => {
		jest.mocked( useOpenDesignSystemToolbar ).mockReturnValue( {
			title: 'Design System',
			icon: () => null,
			onClick,
			selected: true,
		} as ReturnType< typeof useOpenDesignSystemToolbar > );
	} );

	it( 'should be disabled in Legacy', () => {
		jest.mocked( useIsLegacyElementsPanelSelected ).mockReturnValue( true );

		const { result } = renderHook( () => useSidebarDesignSystemProps() );

		expect( result.current.disabled ).toBe( true );
	} );

	it( 'should be enabled in Atomic', () => {
		jest.mocked( useIsLegacyElementsPanelSelected ).mockReturnValue( false );

		const { result } = renderHook( () => useSidebarDesignSystemProps() );

		expect( result.current.disabled ).toBe( false );
	} );

	it( 'should be exclusive and keep selected/onClick from the toolbar hook', () => {
		jest.mocked( useIsLegacyElementsPanelSelected ).mockReturnValue( false );

		const { result } = renderHook( () => useSidebarDesignSystemProps() );

		expect( result.current.exclusive ).toBe( true );
		expect( result.current.selected ).toBe( true );
		expect( result.current.onClick ).toBe( onClick );
	} );
} );
