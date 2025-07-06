import * as React from 'react';
import { createMockDocument, renderWithTheme } from 'test-utils';
import { __useActiveDocument as useActiveDocument } from '@elementor/editor-documents';
import {
	__privateOpenRoute as openRoute,
	__privateUseRouteStatus as useRouteStatus,
} from '@elementor/editor-v1-adapters';
import { fireEvent, screen } from '@testing-library/react';

import SettingsButton from '../settings-button';

jest.mock( '@elementor/editor-v1-adapters' );
jest.mock( '@elementor/editor-documents' );

describe( '@elementor/editor-app-bar - App bar document settings button', () => {
	beforeEach( () => {
		jest.mocked( useRouteStatus ).mockReturnValue( { isActive: false, isBlocked: false } );

		jest.mocked( useActiveDocument ).mockReturnValue(
			createMockDocument( {
				type: { value: 'wp-page', label: 'Page' },
			} )
		);
	} );

	it( 'should open the document settings panel on click', () => {
		// Arrange.
		renderWithTheme( <SettingsButton /> );

		// Act.
		fireEvent.click( screen.getByRole( 'button' ) );

		// Assert.
		expect( openRoute ).toHaveBeenCalledTimes( 1 );
		expect( openRoute ).toHaveBeenCalledWith( 'panel/page-settings/settings' );
	} );

	it( 'should have the correct props for disabled and selected', () => {
		// Arrange.
		jest.mocked( useRouteStatus ).mockReturnValue( { isActive: true, isBlocked: true } );

		// Act.
		renderWithTheme( <SettingsButton /> );

		// Assert.
		const button = screen.getByRole( 'button' );

		expect( button ).toBeDisabled();
		expect( button ).toHaveAttribute( 'aria-pressed', 'true' );
		expect( useRouteStatus ).toHaveBeenCalledTimes( 1 );
		expect( useRouteStatus ).toHaveBeenCalledWith( 'panel/page-settings' );
	} );
} );
