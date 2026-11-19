import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { screen } from '@testing-library/react';

import { mockElement } from '../../../../__tests__/utils';
import { useElement } from '../../../../contexts/element-context';
import { SubmenuToggleControl } from '../../submenu-toggle-control/submenu-toggle-control';
import { SubmenuToggle } from '../submenu-toggle';
import { getSubmenuToggle, registerSubmenuToggle } from '../submenu-toggle-registry';
import { getParentEntryId } from '../use-submenu';

jest.mock( '../../../../contexts/element-context', () => ( {
	...jest.requireActual( '../../../../contexts/element-context' ),
	useElement: jest.fn(),
} ) );
jest.mock( '../use-submenu' );

describe( 'submenu toggle registry', () => {
	afterEach( () => {
		registerSubmenuToggle( SubmenuToggle );
	} );

	it( 'should default to the locked Core toggle', () => {
		// Act & Assert
		expect( getSubmenuToggle() ).toBe( SubmenuToggle );
	} );

	it( 'should render the registered toggle in the Menu Item panel with its entry', () => {
		// Arrange
		jest.mocked( useElement ).mockReturnValue( {
			element: mockElement( { id: 'item-1', type: 'e-menu-item' } ),
		} as never );
		jest.mocked( getParentEntryId ).mockReturnValue( 'entry-1' );
		registerSubmenuToggle( ( { entryId } ) => <span>Pro toggle { entryId }</span> );

		// Act
		renderWithTheme( <SubmenuToggleControl /> );

		// Assert
		expect( screen.getByText( 'Pro toggle entry-1' ) ).toBeInTheDocument();
	} );
} );
