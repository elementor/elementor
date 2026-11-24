import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { ContentPanelCoordinatorProvider } from '../../../contexts/content-panel-coordinator';
import ContentPanelStatusFilterList from '../content-panel-status-filter-list';

type MockStatusCountsResult = {
	data?: Record< string, number >;
	isPending: boolean;
};

const defaultStatusCountsResult = (): MockStatusCountsResult => ( {
	data: {
		draft: 2,
		future: 0,
		pending: 0,
		private: 0,
		publish: 5,
		trash: 1,
	},
	isPending: false,
} );

const mockUseSiteContentStatusFilterCounts = jest.fn( defaultStatusCountsResult );

jest.mock( '../../../hooks/use-accessible-panel-post-types', () => () => ( {
	accessiblePostTypes: [ 'page', 'post' ],
	isUserPending: false,
	showUserLoadError: false,
} ) );

jest.mock( '../../../hooks/use-site-content-status-filter-counts', () => ( {
	useSiteContentStatusFilterCounts: () => mockUseSiteContentStatusFilterCounts(),
} ) );

const renderList = () =>
	renderWithTheme(
		<ContentPanelCoordinatorProvider>
			<ContentPanelStatusFilterList loadCounts />
		</ContentPanelCoordinatorProvider>
	);

describe( 'ContentPanelStatusFilterList', () => {
	afterEach( () => {
		mockUseSiteContentStatusFilterCounts.mockReset();
		mockUseSiteContentStatusFilterCounts.mockImplementation( defaultStatusCountsResult );
	} );

	it( 'shows All as selected when no filters are active', () => {
		renderList();

		expect( screen.getByRole( 'menuitemcheckbox', { name: /All/i } ) ).toBeChecked();
	} );

	it( 'toggles Published without checkboxes', () => {
		renderList();

		const publishedItem = screen.getByRole( 'menuitemcheckbox', { name: /Published/i } );
		fireEvent.click( publishedItem );

		expect( publishedItem ).toBeChecked();
		expect( screen.getByRole( 'menuitemcheckbox', { name: /All/i } ) ).not.toBeChecked();
	} );

	it( 'hides status rows with zero count', () => {
		renderList();

		expect( screen.getByRole( 'menuitemcheckbox', { name: /Published/i } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'menuitemcheckbox', { name: /Pending/i } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'menuitemcheckbox', { name: /Private/i } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'menuitemcheckbox', { name: /Scheduled/i } ) ).not.toBeInTheDocument();
	} );

	it( 'shows only All while status counts are loading', () => {
		mockUseSiteContentStatusFilterCounts.mockImplementation( () => ( {
			data: undefined,
			isPending: true,
		} ) );

		renderList();

		expect( screen.getByRole( 'menuitemcheckbox', { name: /All/i } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'menuitemcheckbox', { name: /Published/i } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'menuitemcheckbox', { name: /Drafts/i } ) ).not.toBeInTheDocument();
	} );
} );
