import { render } from '@testing-library/react';
import PrimaryActionMenu from '../primary-action-menu';
import { documentOptionsMenu } from '../../../menus';

jest.mock( '@elementor/documents', () => ( {
	useActiveDocument: jest.fn(),
} ) );

describe( '@elementor/documents-ui - Primary action menu', () => {
	it( 'should render the actions ordered properly (save, default)', () => {
		// Arrange.
		documentOptionsMenu.registerAction( {
			name: 'test--first-action',
			group: 'save',
			props: {
				title: 'First action',
				icon: () => <span>a</span>,
			},
		} );

		documentOptionsMenu.registerAction( {
			name: 'test--second-action',
			group: 'default',
			props: {
				title: 'Second action',
				icon: () => <span>a</span>,
			},
		} );

		// Act.
		const { getAllByRole } = render( <PrimaryActionMenu open={ true } anchorEl={ document.body } /> );

		// Assert.
		const menuItems = getAllByRole( 'menuitem' );

		expect( menuItems ).toHaveLength( 2 );
		expect( menuItems[ 0 ] ).toHaveTextContent( 'First action' );
		expect( menuItems[ 1 ] ).toHaveTextContent( 'Second action' );
	} );
} );
