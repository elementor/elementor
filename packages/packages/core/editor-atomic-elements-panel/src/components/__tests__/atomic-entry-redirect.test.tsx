import * as React from 'react';
import { __privateUseRouteStatus as useRouteStatus } from '@elementor/editor-v1-adapters';
import { render } from '@testing-library/react';

import { setElementsPanelSelection } from '../../elements-panel-selection';
import { usePanelActions, usePanelStatus } from '../../panel';
import { AtomicEntryRedirect } from '../atomic-entry-redirect';

jest.mock( '@elementor/editor-v1-adapters', () => ( { __privateUseRouteStatus: jest.fn() } ) );
jest.mock( '../../panel', () => ( { usePanelActions: jest.fn(), usePanelStatus: jest.fn() } ) );

describe( 'AtomicEntryRedirect', () => {
	const open = jest.fn();

	beforeEach( () => {
		open.mockClear();
		setElementsPanelSelection( 'atomic' );
		jest.mocked( usePanelActions ).mockReturnValue( { open, close: jest.fn() } );
		jest.mocked( usePanelStatus ).mockReturnValue( { isOpen: false, isBlocked: false } );
		jest.mocked( useRouteStatus ).mockReturnValue( { isActive: true, isBlocked: false } );
	} );

	it( 'should open the atomic panel when the elements route is active and atomic is selected', () => {
		// Act.
		render( <AtomicEntryRedirect /> );

		// Assert.
		expect( open ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should not open the atomic panel when legacy is selected', () => {
		// Arrange.
		setElementsPanelSelection( 'non_atomic' );

		// Act.
		render( <AtomicEntryRedirect /> );

		// Assert.
		expect( open ).not.toHaveBeenCalled();
	} );

	it( 'should not open the atomic panel when it is already open', () => {
		// Arrange.
		jest.mocked( usePanelStatus ).mockReturnValue( { isOpen: true, isBlocked: false } );

		// Act.
		render( <AtomicEntryRedirect /> );

		// Assert.
		expect( open ).not.toHaveBeenCalled();
	} );

	it( 'should not open the atomic panel when the elements route is not active', () => {
		// Arrange.
		jest.mocked( useRouteStatus ).mockReturnValue( { isActive: false, isBlocked: false } );

		// Act.
		render( <AtomicEntryRedirect /> );

		// Assert.
		expect( open ).not.toHaveBeenCalled();
	} );
} );
