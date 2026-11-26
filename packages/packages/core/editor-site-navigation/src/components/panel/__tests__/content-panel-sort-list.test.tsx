import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { SiteContentSectionToolbarProvider } from '../../../contexts/site-content-section-toolbar';
import ContentPanelSortList from '../content-panel-sort-list';

const renderList = () =>
	renderWithTheme(
		<SiteContentSectionToolbarProvider>
			<ContentPanelSortList />
		</SiteContentSectionToolbarProvider>
	);

describe( 'ContentPanelSortList', () => {
	it( 'selects oldest by default', () => {
		renderList();

		expect( screen.getByRole( 'menuitemradio', { name: /Oldest/i, checked: true } ) ).toBeInTheDocument();
	} );

	it( 'updates panel sort when another option is chosen', () => {
		renderList();

		fireEvent.click( screen.getByRole( 'menuitemradio', { name: /Newest/i } ) );

		expect( screen.getByRole( 'menuitemradio', { name: /Newest/i, checked: true } ) ).toBeInTheDocument();
	} );
} );
