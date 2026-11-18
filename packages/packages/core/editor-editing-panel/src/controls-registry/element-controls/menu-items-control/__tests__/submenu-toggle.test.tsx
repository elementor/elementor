import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { SubmenuToggle } from '../submenu-toggle';
import { disableSubmenu, enableSubmenu, selectSubmenu, useSubmenu } from '../use-submenu';

jest.mock( '../use-submenu' );

const promotion = {
	title: 'Mega Menu',
	content: 'Create rich navigation menus with custom layouts, images, and interactive content.',
	ctaUrl: 'https://go.example/submenu',
};

describe( '<SubmenuToggle />', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should show the locked promotion with the approved copy and not enable', () => {
		// Arrange
		jest.mocked( useSubmenu ).mockReturnValue( { submenuId: null, locked: true, promotion } );
		renderWithTheme( <SubmenuToggle entryId="entry-1" /> );

		// Act
		fireEvent.click( screen.getByRole( 'checkbox', { name: 'Enable Submenu' } ) );

		// Assert
		expect( screen.getByText( 'Mega Menu' ) ).toBeInTheDocument();
		expect( screen.getByText( promotion.content ) ).toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'Upgrade Now' } ) ).toHaveAttribute( 'href', promotion.ctaUrl );
		expect( enableSubmenu ).not.toHaveBeenCalled();
		expect( screen.getByRole( 'checkbox', { name: 'Enable Submenu' } ) ).toHaveAttribute( 'aria-expanded', 'true' );
	} );

	it( 'should enable the submenu when entitled', () => {
		// Arrange
		jest.mocked( useSubmenu ).mockReturnValue( { submenuId: null, locked: false, promotion } );
		renderWithTheme( <SubmenuToggle entryId="entry-1" /> );

		// Act
		fireEvent.click( screen.getByRole( 'checkbox', { name: 'Enable Submenu' } ) );

		// Assert
		expect( enableSubmenu ).toHaveBeenCalledWith( 'entry-1' );
		expect( screen.queryByText( 'Mega Menu' ) ).not.toBeInTheDocument();
	} );

	it( 'should disable an existing submenu', () => {
		// Arrange
		jest.mocked( useSubmenu ).mockReturnValue( { submenuId: 'sub-1', locked: false, promotion } );
		renderWithTheme( <SubmenuToggle entryId="entry-1" /> );

		// Act
		fireEvent.click( screen.getByRole( 'checkbox', { name: 'Enable Submenu' } ) );

		// Assert
		expect( disableSubmenu ).toHaveBeenCalledWith( 'entry-1' );
	} );

	it( 'should keep an existing submenu editable when new ones are locked', () => {
		// Arrange
		jest.mocked( useSubmenu ).mockReturnValue( { submenuId: 'sub-1', locked: true, promotion } );
		renderWithTheme( <SubmenuToggle entryId="entry-1" showEditButton /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Edit Submenu' } ) );

		// Assert
		expect( screen.getByRole( 'checkbox', { name: 'Enable Submenu' } ) ).toBeChecked();
		expect( selectSubmenu ).toHaveBeenCalledWith( 'sub-1' );
	} );

	it( 'should show Edit Submenu only when requested and enabled', () => {
		// Arrange
		jest.mocked( useSubmenu ).mockReturnValue( { submenuId: 'sub-1', locked: false, promotion } );

		// Act
		renderWithTheme( <SubmenuToggle entryId="entry-1" /> );

		// Assert
		expect( screen.queryByRole( 'button', { name: 'Edit Submenu' } ) ).not.toBeInTheDocument();
	} );

	it( 'should render nothing without an entry', () => {
		// Arrange
		jest.mocked( useSubmenu ).mockReturnValue( { submenuId: null, locked: true, promotion: null } );

		// Act
		const { container } = renderWithTheme( <SubmenuToggle entryId={ null } /> );

		// Assert
		expect( container ).toBeEmptyDOMElement();
	} );
} );
