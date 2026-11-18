import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { screen } from '@testing-library/react';

import { mockElement } from '../../../../__tests__/utils';
import { useElement } from '../../../../contexts/element-context';
import { getParentEntryId, useSubmenu } from '../../menu-items-control/use-submenu';
import { SubmenuToggleControl } from '../submenu-toggle-control';

jest.mock( '../../../../contexts/element-context', () => ( {
	...jest.requireActual( '../../../../contexts/element-context' ),
	useElement: jest.fn(),
} ) );
jest.mock( '../../menu-items-control/use-submenu', () => ( {
	...jest.requireActual( '../../menu-items-control/use-submenu' ),
	getParentEntryId: jest.fn(),
	useSubmenu: jest.fn(),
} ) );

const promotion = { title: 'Mega Menu', content: 'content', ctaUrl: 'https://go.example' };

describe( '<SubmenuToggleControl />', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( useElement ).mockReturnValue( {
			element: mockElement( { id: 'item-1', type: 'e-menu-item' } ),
		} as never );
		jest.mocked( getParentEntryId ).mockReturnValue( 'entry-1' );
	} );

	it( 'should bind the toggle to the entry that contains the selected menu item', () => {
		// Arrange
		jest.mocked( useSubmenu ).mockReturnValue( { submenuId: null, locked: true, promotion } );

		// Act
		renderWithTheme( <SubmenuToggleControl /> );

		// Assert
		expect( getParentEntryId ).toHaveBeenCalledWith( 'item-1' );
		expect( useSubmenu ).toHaveBeenCalledWith( 'entry-1' );
		expect( screen.getByRole( 'checkbox', { name: 'Enable Submenu' } ) ).not.toBeChecked();
		expect( screen.getByLabelText( 'Promotion chip' ) ).toBeInTheDocument();
	} );

	it( 'should offer Edit Submenu when the entry already has a submenu', () => {
		// Arrange
		jest.mocked( useSubmenu ).mockReturnValue( { submenuId: 'sub-1', locked: true, promotion } );

		// Act
		renderWithTheme( <SubmenuToggleControl /> );

		// Assert
		expect( screen.getByRole( 'button', { name: 'Edit Submenu' } ) ).toBeInTheDocument();
		expect( screen.queryByLabelText( 'Promotion chip' ) ).not.toBeInTheDocument();
	} );

	it( 'should render nothing when the menu item has no entry', () => {
		// Arrange
		jest.mocked( getParentEntryId ).mockReturnValue( null );
		jest.mocked( useSubmenu ).mockReturnValue( { submenuId: null, locked: true, promotion: null } );

		// Act
		const { container } = renderWithTheme( <SubmenuToggleControl /> );

		// Assert
		expect( container ).toBeEmptyDOMElement();
	} );
} );
