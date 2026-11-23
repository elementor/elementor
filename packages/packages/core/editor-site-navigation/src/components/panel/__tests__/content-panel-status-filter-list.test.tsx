import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { ContentPanelCoordinatorProvider } from '../../../contexts/content-panel-coordinator';
import ContentPanelStatusFilterList from '../content-panel-status-filter-list';

describe( 'ContentPanelStatusFilterList', () => {
	it( 'shows All as selected when no filters are active', () => {
		renderWithTheme(
			<ContentPanelCoordinatorProvider>
				<ContentPanelStatusFilterList />
			</ContentPanelCoordinatorProvider>
		);

		expect( screen.getByRole( 'menuitemcheckbox', { name: /All/i } ) ).toBeChecked();
	} );

	it( 'toggles Published without checkboxes', () => {
		renderWithTheme(
			<ContentPanelCoordinatorProvider>
				<ContentPanelStatusFilterList />
			</ContentPanelCoordinatorProvider>
		);

		const publishedItem = screen.getByRole( 'menuitemcheckbox', { name: /Published/i } );
		fireEvent.click( publishedItem );

		expect( publishedItem ).toBeChecked();
		expect( screen.getByRole( 'menuitemcheckbox', { name: /All/i } ) ).not.toBeChecked();
	} );
} );
