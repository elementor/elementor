import { render } from '@testing-library/react';
import PrimaryActionMenu from '../primary-action-menu';
import { documentOptionsMenu } from '../../../menus';

jest.mock( '@elementor/documents', () => ( {
	useActiveDocument: jest.fn(),
} ) );

describe( '@elementor/documents-ui - Primary action menu', () => {
	it.each( [
		'save' as const,
		'default' as const,
	] )( 'should render the %s actions', ( group ) => {
		// Arrange.
		const onClick = jest.fn();

		documentOptionsMenu.registerAction( {
			name: 'test--first-action',
			group,
			props: {
				title: 'First action',
				icon: () => <span>a</span>,
				onClick,
			},
		} );

		documentOptionsMenu.registerAction( {
			name: 'test--second-action',
			group,
			props: {
				title: 'Second action',
				icon: () => <span>a</span>,
				onClick,
			},
		} );

		// Act.
		const { getAllByRole } = render( <PrimaryActionMenu open={ true } anchorEl={ document.body } /> );

		// Assert.
		const menuItems = getAllByRole( 'menuitem' );

		expect( menuItems ).toHaveLength( 2 );
		expect( menuItems[ 0 ] ).toHaveTextContent( 'First action' );
		expect( menuItems[ 1 ] ).toHaveTextContent( 'Second action' );

		// Act.
		menuItems[ 0 ].click();

		// Assert.
		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );
} );
