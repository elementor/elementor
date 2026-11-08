import * as React from 'react';
import { renderWithTheme } from 'test-utils';

import AngiePanel from '../components/angie-panel';

const mockBootAngieSdk = jest.fn();
const mockUseFloatingPanelStatus = jest.fn();
const mockIsAngiePluginInstalled = jest.fn();

jest.mock( '@elementor/editor-angie', () => ( {
	bootAngieSdk: ( ...args: unknown[] ) => mockBootAngieSdk( ...args ),
	isAngiePluginInstalled: () => mockIsAngiePluginInstalled(),
	EDITOR_ANGIE_CONTAINER_ID: 'elementor-editor-angie',
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
		mockIsAngiePluginInstalled.mockReturnValue( false );
	} );

	it( 'does not boot the SDK when the Angie plugin is installed', () => {
		mockIsAngiePluginInstalled.mockReturnValue( true );
		mockUseFloatingPanelStatus.mockReturnValue( { isOpen: true } );

		renderWithTheme( <AngiePanel /> );

		expect( mockBootAngieSdk ).not.toHaveBeenCalled();
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
} );
