import { renderHook } from '@testing-library/react';

import { usePopoverDismiss } from '../use-repeater-popover-dismiss';

jest.mock( '@elementor/editor-responsive', () => ( {
	useActiveBreakpoint: jest.fn( () => 'desktop' ),
	useBreakpoints: jest.fn( () => [ { id: 'desktop', label: 'Desktop', width: undefined, type: undefined } ] ),
} ) );

import { useActiveBreakpoint, useBreakpoints } from '@elementor/editor-responsive';

const desktopOnlyBreakpoints = [ { id: 'desktop', label: 'Desktop', width: undefined, type: undefined } ] as const;

describe( 'usePopoverDismiss', () => {
	beforeEach( () => {
		jest.mocked( useActiveBreakpoint ).mockReturnValue( 'desktop' );
		jest.mocked( useBreakpoints ).mockReturnValue( [ ...desktopOnlyBreakpoints ] );
	} );

	it( 'should invoke onClose once when active breakpoint and breakpoints list both change while open', () => {
		const onClose = jest.fn();

		const { rerender } = renderHook(
			( { isOpen }: { isOpen: boolean } ) => usePopoverDismiss( { isOpen, onClose } ),
			{ initialProps: { isOpen: false } }
		);

		rerender( { isOpen: true } );

		onClose.mockClear();

		jest.mocked( useActiveBreakpoint ).mockReturnValue( 'tablet' );
		jest.mocked( useBreakpoints ).mockReturnValue( [
			...desktopOnlyBreakpoints,
			{ id: 'tablet', label: 'Tablet', width: 1024, type: undefined },
		] );

		rerender( { isOpen: true } );

		expect( onClose ).toHaveBeenCalledTimes( 1 );
	} );
} );
