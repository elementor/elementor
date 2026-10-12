import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeSettingsRow } from 'elementor/app/modules/import-export-customization/assets/js/shared/components/settings-customization-sections';

describe( 'ThemeSettingsRow', () => {
	it( 'uses the legacy manifest.theme path for old exports', () => {
		// Arrange
		const contextData = {
			isOldExport: true,
			data: {
				uploadedData: {
					manifest: {
						theme: true,
					},
				},
			},
		};

		// Act
		render(
			<ThemeSettingsRow
				contextData={ contextData }
				isImport={ true }
				onSettingChange={ jest.fn() }
				settings={ { theme: true } }
			/>,
		);

		// Assert
		expect( screen.queryByText( 'Not exported' ) ).toBeFalsy();
		expect( screen.getByRole( 'checkbox' ) ).not.toBeDisabled();
	} );
} );
