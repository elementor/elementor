import * as React from 'react';
import {
	__privateUseListenTo as useListenTo,
	__privateUseRouteStatus as useRouteStatus,
} from '@elementor/editor-v1-adapters';
import { render, screen } from '@testing-library/react';

import { usePanelActions, usePanelStatus } from '../../panel';
import { LegacyPanelSwitcher } from '../legacy-panel-switcher';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateUseListenTo: jest.fn(),
	__privateUseRouteStatus: jest.fn(),
	routeOpenEvent: jest.fn(),
	v1ReadyEvent: jest.fn(),
} ) );
jest.mock( '../../panel', () => ( { usePanelActions: jest.fn(), usePanelStatus: jest.fn() } ) );

describe( 'LegacyPanelSwitcher', () => {
	let header: HTMLElement;

	beforeEach( () => {
		header = document.createElement( 'div' );
		header.id = 'elementor-panel-header';
		document.body.appendChild( header );

		jest.mocked( usePanelActions ).mockReturnValue( { open: jest.fn(), close: jest.fn() } );
		jest.mocked( usePanelStatus ).mockReturnValue( { isOpen: false, isBlocked: false } );
		jest.mocked( useListenTo ).mockImplementation( ( _, getValue ) => getValue() );
	} );

	afterEach( () => {
		header.remove();
	} );

	it( 'should render the switcher inside the panel header when the elements route is active', () => {
		// Arrange.
		jest.mocked( useRouteStatus ).mockReturnValue( { isActive: true, isBlocked: false } );

		// Act.
		render( <LegacyPanelSwitcher /> );

		// Assert.
		expect( header.contains( screen.getByLabelText( 'Elements panel' ) ) ).toBe( true );
	} );

	it( 'should not render the switcher when the elements route is not active', () => {
		// Arrange.
		jest.mocked( useRouteStatus ).mockReturnValue( { isActive: false, isBlocked: false } );

		// Act.
		render( <LegacyPanelSwitcher /> );

		// Assert.
		expect( screen.queryByLabelText( 'Elements panel' ) ).not.toBeInTheDocument();
	} );
} );
