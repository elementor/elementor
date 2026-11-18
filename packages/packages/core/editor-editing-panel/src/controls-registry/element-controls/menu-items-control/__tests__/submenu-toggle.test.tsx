import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { SubmenuToggle } from '../submenu-toggle';
import { getSubmenuPromotion } from '../use-submenu';

jest.mock( '../use-submenu' );

const promotion = {
	title: 'Mega Menu',
	content: 'Create rich navigation menus with custom layouts, images, and interactive content.',
	ctaUrl: 'https://go.example/submenu',
};

describe( '<SubmenuToggle />', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( getSubmenuPromotion ).mockReturnValue( promotion );
	} );

	it( 'should render an unchecked switch with the Pro crown', () => {
		// Act
		renderWithTheme( <SubmenuToggle entryId="entry-1" /> );

		// Assert
		expect( screen.getByRole( 'checkbox', { name: 'Enable Submenu' } ) ).toBeEnabled();
		expect( screen.getByRole( 'checkbox', { name: 'Enable Submenu' } ) ).not.toBeChecked();
		expect( screen.getByLabelText( 'Promotion chip' ) ).toBeInTheDocument();
	} );

	it( 'should open the promotion with the approved copy and the upgrade link from the crown', () => {
		// Arrange
		renderWithTheme( <SubmenuToggle entryId="entry-1" /> );

		// Act
		fireEvent.click( screen.getByLabelText( 'Promotion chip' ) );

		// Assert
		expect( screen.getByText( 'Mega Menu' ) ).toBeInTheDocument();
		expect( screen.getByText( promotion.content ) ).toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'Upgrade Now' } ) ).toHaveAttribute( 'href', promotion.ctaUrl );
	} );

	it( 'should open the promotion when the switch is clicked without flipping it', () => {
		// Arrange
		renderWithTheme( <SubmenuToggle entryId="entry-1" /> );

		// Act
		fireEvent.click( screen.getByRole( 'checkbox', { name: 'Enable Submenu' } ) );

		// Assert
		expect( screen.getByText( 'Mega Menu' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'checkbox', { name: 'Enable Submenu' } ) ).not.toBeChecked();
	} );

	it( 'should render nothing when there is no promotion to show', () => {
		// Arrange
		jest.mocked( getSubmenuPromotion ).mockReturnValue( null );

		// Act
		const { container } = renderWithTheme( <SubmenuToggle entryId="entry-1" /> );

		// Assert
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should render nothing without an entry', () => {
		// Act
		const { container } = renderWithTheme( <SubmenuToggle entryId={ null } /> );

		// Assert
		expect( container ).toBeEmptyDOMElement();
	} );
} );
