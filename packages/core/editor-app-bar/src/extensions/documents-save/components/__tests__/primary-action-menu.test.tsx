import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { screen } from '@testing-library/react';

import { documentOptionsMenu } from '../../locations';
import PrimaryActionMenu from '../primary-action-menu';

jest.mock( '@elementor/editor-documents' );

describe( '@elementor/editor-app-bar - Primary action menu', () => {
	it( 'should render the actions ordered properly (save, default)', () => {
		// Arrange.
		documentOptionsMenu.registerAction( {
			id: 'test--first-action',
			group: 'save',
			props: {
				title: 'First action',
				icon: () => <span>a</span>,
			},
		} );

		documentOptionsMenu.registerAction( {
			id: 'test--second-action',
			group: 'default',
			props: {
				title: 'Second action',
				icon: () => <span>a</span>,
			},
		} );

		// Act.
		renderWithTheme( <PrimaryActionMenu open={ true } anchorEl={ document.body } /> );

		// Assert.
		const menuItems = screen.getAllByRole( 'menuitem' );

		expect( menuItems ).toHaveLength( 2 );
		expect( menuItems[ 0 ] ).toHaveTextContent( 'First action' );
		expect( menuItems[ 1 ] ).toHaveTextContent( 'Second action' );
	} );
} );
