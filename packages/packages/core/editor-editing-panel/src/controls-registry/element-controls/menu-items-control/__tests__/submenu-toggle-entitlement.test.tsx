import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { getContainer, getWidgetsCache, type V1Element } from '@elementor/editor-elements';
import { fireEvent, screen } from '@testing-library/react';

import { SubmenuToggle } from '../submenu-toggle';

jest.mock( '@elementor/editor-elements' );
jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	__privateRunCommand: jest.fn(),
	__privateUseListenTo: jest.fn( ( _events, getSnapshot ) => getSnapshot() ),
} ) );

const promotion = {
	title: 'Mega Menu',
	content: 'Create rich navigation menus with custom layouts, images, and interactive content.',
	ctaUrl: 'https://go.example/mega-menu',
};

describe( '<SubmenuToggle /> with the widgets cache entitlement', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( getContainer ).mockReturnValue( { children: [] } as unknown as V1Element );
	} );

	it( 'should render the locked promotion from the entitlement meta of the entry', () => {
		// Arrange
		jest.mocked( getWidgetsCache ).mockReturnValue( {
			'e-menu-entry': { meta: { submenu_entitlement: { locked: true, promotion } } },
		} as never );
		renderWithTheme( <SubmenuToggle entryId="entry-1" /> );

		// Act
		fireEvent.click( screen.getByLabelText( 'Promotion chip' ) );

		// Assert
		expect( screen.getByLabelText( 'Promotion chip' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Mega Menu' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'Upgrade Now' } ) ).toHaveAttribute( 'href', promotion.ctaUrl );
	} );

	it( 'should not show the promotion when the entitlement is unlocked', () => {
		// Arrange
		jest.mocked( getWidgetsCache ).mockReturnValue( {
			'e-menu-entry': { meta: { submenu_entitlement: { locked: false, promotion } } },
		} as never );

		// Act
		renderWithTheme( <SubmenuToggle entryId="entry-1" /> );

		// Assert
		expect( screen.queryByLabelText( 'Promotion chip' ) ).not.toBeInTheDocument();
	} );
} );
