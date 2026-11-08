import * as React from 'react';
import { renderWithTheme } from 'test-utils';

import AngiePanel from '../components/angie-panel';

const mockBootAngieSdk = jest.fn();
const mockUseFloatingPanelStatus = jest.fn();

jest.mock( '@elementor/editor-angie', () => ( {
	bootAngieSdk: ( ...args: unknown[] ) => mockBootAngieSdk( ...args ),
	EDITOR_ANGIE_CONTAINER_ID: 'elementor-editor-angie',
	removeAngieSidebarActiveBodyClass: jest.fn(),
} ) );

jest.mock( '@elementor/editor-floating-panels', () => ( {
	FloatingPanelHeader: () => null,
	FloatingPanelBody: ( { children }: { children?: unknown } ) => children ?? null,
	useFloatingPanelStatus: () => mockUseFloatingPanelStatus(),
} ) );

describe( 'AngiePanel lazy boot', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockBootAngieSdk.mockResolvedValue( {} );
		mockUseFloatingPanelStatus.mockReturnValue( { isOpen: false } );
	} );

	it( 'does not boot the SDK when the panel stays closed', () => {
		renderWithTheme( <AngiePanel /> );

		expect( mockBootAngieSdk ).not.toHaveBeenCalled();
	} );

	it( 'boots the SDK the first time the panel becomes visible', () => {
		mockUseFloatingPanelStatus.mockReturnValue( { isOpen: true } );

		renderWithTheme( <AngiePanel /> );

		expect( mockBootAngieSdk ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'keeps a single SDK boot across close and reopen', () => {
		mockUseFloatingPanelStatus.mockReturnValue( { isOpen: true } );
		const { rerender } = renderWithTheme( <AngiePanel /> );

		mockUseFloatingPanelStatus.mockReturnValue( { isOpen: false } );
		rerender( <AngiePanel /> );

		mockUseFloatingPanelStatus.mockReturnValue( { isOpen: true } );
		rerender( <AngiePanel /> );

		expect( mockBootAngieSdk ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not boot twice while a boot is still pending', async () => {
		let resolveBoot: ( value: unknown ) => void = () => {};
		mockBootAngieSdk.mockReturnValueOnce(
			new Promise( ( resolve ) => {
				resolveBoot = resolve;
			} )
		);
		mockUseFloatingPanelStatus.mockReturnValue( { isOpen: true } );
		const { rerender } = renderWithTheme( <AngiePanel /> );

		mockUseFloatingPanelStatus.mockReturnValue( { isOpen: false } );
		rerender( <AngiePanel /> );

		mockUseFloatingPanelStatus.mockReturnValue( { isOpen: true } );
		rerender( <AngiePanel /> );

		expect( mockBootAngieSdk ).toHaveBeenCalledTimes( 1 );

		resolveBoot( {} );
		await mockBootAngieSdk.mock.results[ 0 ].value;
	} );
} );
