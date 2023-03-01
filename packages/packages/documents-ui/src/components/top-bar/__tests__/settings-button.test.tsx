import SettingsButton from '../settings-button';
import { openRoute, useRouteStatus } from '@elementor/v1-adapters';
import { render } from '@testing-library/react';

jest.mock( '@elementor/v1-adapters', () => ( {
	openRoute: jest.fn(),
	useRouteStatus: jest.fn( () => ( { isActive: false, isBlocked: false } ) ),
} ) );

describe( '@elementor/documents-ui - Top bar settings button', () => {
	const Component = () => <SettingsButton type={ { value: 'wp-page', label: 'Page' } } />;

	it( 'should open the document settings panel on click', () => {
		// Arrange.
		const { getByRole } = render( <Component /> );

		// Act.
		getByRole( 'button' ).click();

		// Assert.
		expect( openRoute ).toHaveBeenCalledTimes( 1 );
		expect( openRoute ).toHaveBeenCalledWith( 'panel/page-settings/settings' );
	} );

	it( 'should have the correct props for disabled and selected', () => {
		// Arrange.
		jest.mocked( useRouteStatus ).mockReturnValue( { isActive: true, isBlocked: true } );

		// Act.
		const { getByRole } = render( <Component /> );

		// Assert.
		const button = getByRole( 'button' );

		expect( button ).toHaveAttribute( 'disabled' );
		expect( button ).toHaveAttribute( 'aria-pressed', 'true' );
		expect( useRouteStatus ).toHaveBeenCalledTimes( 1 );
		expect( useRouteStatus ).toHaveBeenCalledWith( 'panel/page-settings' );
	} );
} );
