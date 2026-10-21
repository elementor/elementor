/* eslint-disable react/prop-types */
import { render, screen } from '@testing-library/react';

import { BrowserToolsPanel } from 'elementor/modules/agents/assets/js/admin/components/browser-tools/browser-tools-panel';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text ) => text,
} ) );

jest.mock( '@elementor/icons', () => ( {
	ArrowUpRightIcon: () => <span />,
	BriefcaseIcon: () => <span />,
	FileTextIcon: () => <span />,
	SearchIcon: () => <span />,
	SitemapIcon: () => <span />,
} ) );

jest.mock( '@elementor/ui/Alert', () => ( { children } ) => <div role="alert">{ children }</div> );
jest.mock( '@elementor/ui/Divider', () => () => <hr /> );
jest.mock( '@elementor/ui/Link', () => ( { children, href } ) => <a href={ href }>{ children }</a> );
jest.mock( '@elementor/ui/Stack', () => ( { children } ) => <div>{ children }</div> );
jest.mock( '@elementor/ui/Typography', () => ( { children, color } ) => <span data-color={ color }>{ children }</span> );

const EDIT_DETAILS_URL = 'https://example.com/wp-admin/post.php?post=2&action=edit';

const tools = [
	{ name: 'search_site_content', label: 'Search site content', description: 'Find pages.' },
	{ name: 'query_business_info', label: 'Get business information', description: 'Business details.' },
	{ name: 'read_page_content', label: 'Read page content', description: 'Page text.' },
];

const renderPanel = ( settings, isMarkdownEnabled = false ) => render(
	<BrowserToolsPanel
		settings={ { editDetailsUrl: EDIT_DETAILS_URL, isAvailable: true, tools, ...settings } }
		isMarkdownEnabled={ isMarkdownEnabled }
	/>,
);

describe( 'BrowserToolsPanel', () => {
	it( 'renders every tool with the active styling', () => {
		// Arrange & Act
		renderPanel();

		// Assert
		expect( screen.getByText( 'Search site content' ).getAttribute( 'data-color' ) ).toBe( 'text.primary' );
		expect( screen.getByText( 'Get business information' ).getAttribute( 'data-color' ) ).toBe( 'text.primary' );
		expect( screen.getByText( 'Business details.' ).getAttribute( 'data-color' ) ).toBe( 'text.secondary' );
	} );

	it( 'always links business information to the edit details URL', () => {
		// Arrange & Act
		renderPanel();

		// Assert
		expect( screen.getAllByRole( 'link', { name: 'Edit details' } ) ).toHaveLength( 1 );
		expect( screen.getByRole( 'link', { name: 'Edit details' } ).getAttribute( 'href' ) ).toBe( EDIT_DETAILS_URL );
	} );

	it( 'explains that read page content needs Markdown when Markdown is off', () => {
		// Arrange & Act
		renderPanel();

		// Assert
		expect( screen.getByText( 'Turn on Markdown content to make this tool available.' ) ).toBeTruthy();
	} );

	it( 'hides the Markdown notice as soon as Markdown is on', () => {
		// Arrange & Act
		renderPanel( {}, true );

		// Assert
		expect( screen.queryByText( 'Turn on Markdown content to make this tool available.' ) ).toBeNull();
	} );

	it( 'shows a notice when the Abilities API is unavailable', () => {
		// Arrange & Act
		renderPanel( { isAvailable: false } );

		// Assert
		expect( screen.getByRole( 'alert' ).textContent ).toContain( 'WordPress 6.9' );
	} );
} );
