import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { screen } from '@testing-library/react';

import { mockElement } from '../../../../__tests__/utils';
import { useElement } from '../../../../contexts/element-context';
import { getParentEntryId, getSubmenuPromotion } from '../../menu-items-control/use-submenu';
import { SubmenuToggleControl } from '../submenu-toggle-control';

jest.mock( '../../../../contexts/element-context', () => ( {
	...jest.requireActual( '../../../../contexts/element-context' ),
	useElement: jest.fn(),
} ) );
jest.mock( '../../menu-items-control/use-submenu' );

describe( '<SubmenuToggleControl />', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( useElement ).mockReturnValue( {
			element: mockElement( { id: 'item-1', type: 'e-menu-item' } ),
		} as never );
		jest.mocked( getParentEntryId ).mockReturnValue( 'entry-1' );
		jest.mocked( getSubmenuPromotion ).mockReturnValue( {
			title: 'Mega Menu',
			content: 'c',
			ctaUrl: 'https://go.example',
		} );
	} );

	it( 'should show the locked switch for the entry that contains the selected menu item', () => {
		// Act
		renderWithTheme( <SubmenuToggleControl /> );

		// Assert
		expect( screen.getByRole( 'checkbox', { name: 'Enable Submenu' } ) ).toBeEnabled();
		expect( screen.getByLabelText( 'Promotion chip' ) ).toBeInTheDocument();
	} );

	it( 'should render nothing when the menu item has no entry', () => {
		// Arrange
		jest.mocked( getParentEntryId ).mockReturnValue( null );

		// Act
		const { container } = renderWithTheme( <SubmenuToggleControl /> );

		// Assert
		expect( container ).toBeEmptyDOMElement();
	} );
} );
