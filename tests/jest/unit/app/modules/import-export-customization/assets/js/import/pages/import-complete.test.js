import React from 'react';
import { render, screen } from '@testing-library/react';
import ImportComplete from 'elementor/app/modules/import-export-customization/assets/js/import/pages/import-complete';
import eventsConfig from 'elementor/core/common/modules/events-manager/assets/js/events-config';
import useContextDetection from 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-context-detection';

const mockUseImportContext = jest.fn();
const mockNavigate = jest.fn();

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-context-detection' );

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/import/context/import-context', () => ( {
	useImportContext: () => mockUseImportContext(),
} ) );

jest.mock( '@reach/router', () => ( {
	useNavigate: () => mockNavigate,
} ) );

const mockSendPageViewsWebsiteTemplates = jest.fn();
const mockSendImportKitCustomization = jest.fn();
jest.mock( 'elementor/app/assets/js/event-track/apps-event-tracking', () => ( {
	AppsEventTracking: {
		sendPageViewsWebsiteTemplates: ( ...args ) => mockSendPageViewsWebsiteTemplates( ...args ),
		sendImportKitCustomization: ( ...args ) => mockSendImportKitCustomization( ...args ),
	},
} ) );
describe( 'ImportComplete Page', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		useContextDetection.mockImplementation( () => ( {
			isImport: true,
			contextData: { data: { kitUploadParams: { source: 'cloud' } } },
		} ) );
		global.elementorAppConfig = { assets_url: 'http://localhost/assets/' };
		global.elementorCommon = {
			eventsManager: {
				config: eventsConfig,
			},
		};
	} );

	afterEach( () => {
		delete global.elementorAppConfig;
		delete global.elementorCommon;
	} );

	function setup( { isCompleted = true } = {} ) {
		mockUseImportContext.mockReturnValue( {
			isCompleted,
			data: {
				includes: [ 'settings', 'content', 'plugins' ],
			},
			runnersState: {
				plugins: [ 'WooCommerce', 'Advanced Custom Fields' ],
			},
		} );
	}

	it( 'renders the main success message and sections when completed', () => {
		// Arrange
		setup( { isCompleted: true } );
		// Act
		render( <ImportComplete /> );
		// Assert
		expect( screen.getByText( /Your website templates is now live on your site!/i ) ).toBeTruthy();
		expect( screen.getByText( /You've imported and applied the following to your site:/i ) ).toBeTruthy();
		expect( screen.getByText( /What's included:/i ) ).toBeTruthy();
		expect( screen.getByText( /Site settings/i ) ).toBeTruthy();
		expect( screen.getByText( /Content/ ) ).toBeTruthy();
		expect( screen.getByText( /Plugins/ ) ).toBeTruthy();
		expect( screen.getByText( /Show me how/i ) ).toBeTruthy();
		expect( screen.getByRole( 'img', { name: /Kit is live illustration/i } ) ).toBeTruthy();
	} );

	it( 'renders footer buttons', () => {
		// Arrange
		setup( { isCompleted: true } );
		// Act
		render( <ImportComplete /> );
		// Assert
		const seeItLiveBtn = screen.getByTestId( 'see-it-live-button' );
		const closeBtn = screen.getByTestId( 'close-button' );
		expect( seeItLiveBtn ).toBeTruthy();
		expect( closeBtn ).toBeTruthy();
		expect( seeItLiveBtn.textContent ).toMatch( /See it Live/i );
		expect( closeBtn.textContent ).toMatch( /Close/i );
	} );

	it( 'redirects to /import if not completed', () => {
		// Arrange
		setup( { isCompleted: false } );
		// Act
		render( <ImportComplete /> );
		// Assert
		expect( mockNavigate ).toHaveBeenCalledWith( '/import', { replace: true } );
		expect( mockSendImportKitCustomization ).toHaveBeenCalledWith( expect.objectContaining( {
			kit_description: false,
			kit_import_content: true,
			kit_import_plugins: true,
			kit_import_settings: true,
			kit_import_templates: false,
			kit_source: 'file',
		} ) );
	} );

	describe( 'getContentSummary function', () => {
		beforeEach( () => {
			global.elementorAppConfig = {
				assets_url: 'http://localhost/assets/',
				'import-export-customization': {
					summaryTitles: {
						content: {
							page: { single: 'Page', plural: 'Pages' },
							post: { single: 'Post', plural: 'Posts' },
							product: { single: 'Product', plural: 'Products' },
						},
					},
				},
			};
		} );

		it( 'shows "No content imported" when no content exists', () => {
			// Arrange
			mockUseImportContext.mockReturnValue( {
				isCompleted: true,
				data: { includes: [ 'content' ] },
				runnersState: {
					plugins: [],
				},
			} );
			// Act
			render( <ImportComplete /> );
			// Assert
			expect( screen.getByText( 'No content imported' ) ).toBeTruthy();
		} );

		it( 'shows "No content imported" when only failed items exist', () => {
			// Arrange
			mockUseImportContext.mockReturnValue( {
				isCompleted: true,
				data: { includes: [ 'content' ] },
				runnersState: {
					plugins: [],
					'wp-content': {
						page: {
							succeed: {},
							failed: [ { id: 1, error: 'Failed' } ],
						},
					},
				},
			} );
			// Act
			render( <ImportComplete /> );
			// Assert
			expect( screen.getByText( 'No content imported' ) ).toBeTruthy();
		} );

		it( 'counts succeed items from wp-content section', () => {
			// Arrange
			mockUseImportContext.mockReturnValue( {
				isCompleted: true,
				data: { includes: [ 'content' ] },
				runnersState: {
					plugins: [],
					'wp-content': {
						page: {
							succeed: { 1: 101, 2: 102 },
							failed: [],
						},
						post: {
							succeed: { 3: 103 },
							failed: [],
						},
					},
				},
			} );
			// Act
			render( <ImportComplete /> );
			// Assert
			expect( screen.getByText( '2 Pages | 1 Post' ) ).toBeTruthy();
		} );

		it( 'counts succeed items from content section', () => {
			// Arrange
			mockUseImportContext.mockReturnValue( {
				isCompleted: true,
				data: { includes: [ 'content' ] },
				runnersState: {
					plugins: [],
					content: {
						page: {
							succeed: { 1: 101, 2: 102, 3: 103 },
							failed: [],
						},
						product: {
							succeed: { 4: 104 },
							failed: [],
						},
					},
				},
			} );
			// Act
			render( <ImportComplete /> );
			// Assert
			expect( screen.getByText( '3 Pages | 1 Product' ) ).toBeTruthy();
		} );

		it( 'counts succeed items from elementor-content section', () => {
			// Arrange
			mockUseImportContext.mockReturnValue( {
				isCompleted: true,
				data: { includes: [ 'content' ] },
				runnersState: {
					plugins: [],
					'elementor-content': {
						page: {
							succeed: { 1: 101 },
							failed: [],
						},
						post: {
							succeed: { 2: 102, 3: 103 },
							failed: [],
						},
					},
				},
			} );
			// Act
			render( <ImportComplete /> );
			// Assert
			expect( screen.getByText( '1 Page | 2 Posts' ) ).toBeTruthy();
		} );

		it( 'counts taxonomies correctly', () => {
			// Arrange
			mockUseImportContext.mockReturnValue( {
				isCompleted: true,
				data: { includes: [ 'content' ] },
				runnersState: {
					plugins: [],
					taxonomies: {
						product: {
							product_type: [
								{ old_id: 1, new_id: 1 },
								{ old_id: 2, new_id: 2 },
							],
							product_cat: [
								{ old_id: 3, new_id: 3 },
							],
						},
						category: {
							post_tag: [
								{ old_id: 4, new_id: 4 },
								{ old_id: 5, new_id: 5 },
								{ old_id: 6, new_id: 6 },
							],
						},
					},
				},
			} );
			// Act
			render( <ImportComplete /> );
			// Assert
			expect( screen.getByText( '6 Taxonomies' ) ).toBeTruthy();
		} );

		it( 'shows singular form for single taxonomy', () => {
			// Arrange
			mockUseImportContext.mockReturnValue( {
				isCompleted: true,
				data: { includes: [ 'content' ] },
				runnersState: {
					plugins: [],
					taxonomies: {
						product: {
							product_type: [
								{ old_id: 1, new_id: 1 },
							],
						},
					},
				},
			} );
			// Act
			render( <ImportComplete /> );
			// Assert
			expect( screen.getByText( '1 Taxonomy' ) ).toBeTruthy();
		} );

		it( 'counts taxonomies correctly for the provided example', () => {
			// Arrange - matches the exact example provided by user
			mockUseImportContext.mockReturnValue( {
				isCompleted: true,
				data: { includes: [ 'content' ] },
				runnersState: {
					plugins: [],
					taxonomies: {
						product: {
							product_type: [
								{ old_id: 5, new_id: 5, old_slug: 'external', new_slug: 'external' },
								{ old_id: 3, new_id: 3, old_slug: 'grouped', new_slug: 'grouped' },
								{ old_id: 2, new_id: 2, old_slug: 'simple', new_slug: 'simple' },
								{ old_id: 4, new_id: 4, old_slug: 'variable', new_slug: 'variable' },
							],
							product_visibility: [
								{ old_id: 7, new_id: 7, old_slug: 'exclude-from-catalog', new_slug: 'exclude-from-catalog' },
								{ old_id: 6, new_id: 6, old_slug: 'exclude-from-search', new_slug: 'exclude-from-search' },
								{ old_id: 8, new_id: 8, old_slug: 'featured', new_slug: 'featured' },
								{ old_id: 9, new_id: 9, old_slug: 'outofstock', new_slug: 'outofstock' },
								{ old_id: 10, new_id: 10, old_slug: 'rated-1', new_slug: 'rated-1' },
								{ old_id: 11, new_id: 11, old_slug: 'rated-2', new_slug: 'rated-2' },
								{ old_id: 12, new_id: 12, old_slug: 'rated-3', new_slug: 'rated-3' },
								{ old_id: 13, new_id: 13, old_slug: 'rated-4', new_slug: 'rated-4' },
								{ old_id: 14, new_id: 14, old_slug: 'rated-5', new_slug: 'rated-5' },
							],
							product_cat: [
								{ old_id: 15, new_id: 15, old_slug: 'uncategorized', new_slug: 'uncategorized' },
							],
						},
					},
				},
			} );
			// Act
			render( <ImportComplete /> );
			// Assert
			expect( screen.getByText( '14 Taxonomies' ) ).toBeTruthy();
		} );

		it( 'combines counts from multiple sections for same content type', () => {
			// Arrange
			mockUseImportContext.mockReturnValue( {
				isCompleted: true,
				data: { includes: [ 'content' ] },
				runnersState: {
					plugins: [],
					'wp-content': {
						page: {
							succeed: { 1: 101, 2: 102 },
							failed: [],
						},
					},
					content: {
						page: {
							succeed: { 3: 103 },
							failed: [],
						},
					},
					'elementor-content': {
						page: {
							succeed: { 4: 104, 5: 105 },
							failed: [],
						},
					},
				},
			} );
			// Act
			render( <ImportComplete /> );
			// Assert
			expect( screen.getByText( '5 Pages' ) ).toBeTruthy();
		} );

		it( 'combines content types and taxonomies', () => {
			// Arrange
			mockUseImportContext.mockReturnValue( {
				isCompleted: true,
				data: { includes: [ 'content' ] },
				runnersState: {
					plugins: [],
					'wp-content': {
						page: {
							succeed: { 1: 101, 2: 102 },
							failed: [],
						},
						post: {
							succeed: { 3: 103 },
							failed: [],
						},
					},
					taxonomies: {
						product: {
							product_type: [
								{ old_id: 1, new_id: 1 },
								{ old_id: 2, new_id: 2 },
							],
						},
					},
				},
			} );
			// Act
			render( <ImportComplete /> );
			// Assert
			expect( screen.getByText( '2 Pages | 1 Post | 2 Taxonomies' ) ).toBeTruthy();
		} );

		it( 'handles empty runnersState gracefully', () => {
			// Arrange
			mockUseImportContext.mockReturnValue( {
				isCompleted: true,
				data: { includes: [ 'content' ] },
				runnersState: {},
			} );
			// Act
			render( <ImportComplete /> );
			// Assert
			expect( screen.getByText( 'No content imported' ) ).toBeTruthy();
		} );

		it( 'handles undefined runnersState gracefully', () => {
			// Arrange
			mockUseImportContext.mockReturnValue( {
				isCompleted: true,
				data: { includes: [ 'content' ] },
				runnersState: undefined,
			} );
			// Act
			render( <ImportComplete /> );
			// Assert
			expect( screen.getByText( 'No content imported' ) ).toBeTruthy();
		} );

		it( 'counts nav menu items from wp-content section', () => {
			// Arrange
			mockUseImportContext.mockReturnValue( {
				isCompleted: true,
				data: { includes: [ 'content' ] },
				runnersState: {
					plugins: [],
					'wp-content': {
						nav_menu_item: {
							succeed: { 1: 101, 2: 102, 3: 103 },
							failed: [],
						},
					},
				},
			} );
			// Act
			render( <ImportComplete /> );
			// Assert
			expect( screen.getByText( '3 Menus' ) ).toBeTruthy();
		} );

		it( 'counts nav menu items from content section', () => {
			// Arrange
			mockUseImportContext.mockReturnValue( {
				isCompleted: true,
				data: { includes: [ 'content' ] },
				runnersState: {
					plugins: [],
					content: {
						nav_menu_item: {
							succeed: { 1: 101 },
							failed: [],
						},
					},
				},
			} );
			// Act
			render( <ImportComplete /> );
			// Assert
			expect( screen.getByText( '1 Menu' ) ).toBeTruthy();
		} );

		it( 'counts nav menu items from elementor-content section', () => {
			// Arrange
			mockUseImportContext.mockReturnValue( {
				isCompleted: true,
				data: { includes: [ 'content' ] },
				runnersState: {
					plugins: [],
					'elementor-content': {
						nav_menu_item: {
							succeed: { 1: 101, 2: 102 },
							failed: [],
						},
					},
				},
			} );
			// Act
			render( <ImportComplete /> );
			// Assert
			expect( screen.getByText( '2 Menus' ) ).toBeTruthy();
		} );

		it( 'combines nav menu items from multiple sections', () => {
			// Arrange
			mockUseImportContext.mockReturnValue( {
				isCompleted: true,
				data: { includes: [ 'content' ] },
				runnersState: {
					plugins: [],
					'wp-content': {
						nav_menu_item: {
							succeed: { 1: 101, 2: 102 },
							failed: [],
						},
					},
					content: {
						nav_menu_item: {
							succeed: { 3: 103 },
							failed: [],
						},
					},
					'elementor-content': {
						nav_menu_item: {
							succeed: { 4: 104, 5: 105 },
							failed: [],
						},
					},
				},
			} );
			// Act
			render( <ImportComplete /> );
			// Assert
			expect( screen.getByText( '5 Menus' ) ).toBeTruthy();
		} );

		it( 'combines nav menu items with other content types', () => {
			// Arrange
			mockUseImportContext.mockReturnValue( {
				isCompleted: true,
				data: { includes: [ 'content' ] },
				runnersState: {
					plugins: [],
					'wp-content': {
						page: {
							succeed: { 1: 101, 2: 102 },
							failed: [],
						},
						nav_menu_item: {
							succeed: { 3: 103, 4: 104 },
							failed: [],
						},
					},
					taxonomies: {
						product: {
							product_type: [
								{ old_id: 1, new_id: 1 },
							],
						},
					},
				},
			} );
			// Act
			render( <ImportComplete /> );
			// Assert
			expect( screen.getByText( '2 Pages | 1 Taxonomy | 2 Menus' ) ).toBeTruthy();
		} );

		it( 'does not show menus when count is 0', () => {
			// Arrange
			mockUseImportContext.mockReturnValue( {
				isCompleted: true,
				data: { includes: [ 'content' ] },
				runnersState: {
					plugins: [],
					'wp-content': {
						nav_menu_item: {
							succeed: {},
							failed: [ { id: 1, error: 'Failed' } ],
						},
					},
				},
			} );
			// Act
			render( <ImportComplete /> );
			// Assert
			expect( screen.getByText( 'No content imported' ) ).toBeTruthy();
		} );

		it( 'does not show menus when nav_menu_item does not exist', () => {
			// Arrange
			mockUseImportContext.mockReturnValue( {
				isCompleted: true,
				data: { includes: [ 'content' ] },
				runnersState: {
					plugins: [],
					'wp-content': {
						page: {
							succeed: { 1: 101 },
							failed: [],
						},
					},
				},
			} );
			// Act
			render( <ImportComplete /> );
			// Assert
			expect( screen.getByText( '1 Page' ) ).toBeTruthy();
			expect( screen.queryByText( /Menu/ ) ).toBeFalsy();
		} );

		it( 'correctly combines pages from content and wp-content sections', () => {
			// Arrange - matches the exact example provided by user
			mockUseImportContext.mockReturnValue( {
				isCompleted: true,
				data: { includes: [ 'content' ] },
				runnersState: {
					plugins: [ 'Elementor' ],
					taxonomies: {
						post: {
							category: [
								{ old_id: 1, new_id: 1, old_slug: 'uncategorized', new_slug: 'uncategorized' },
							],
						},
						product: {
							product_type: [
								{ old_id: 7, new_id: 5, old_slug: 'external', new_slug: 'external' },
								{ old_id: 5, new_id: 3, old_slug: 'grouped', new_slug: 'grouped' },
								{ old_id: 4, new_id: 2, old_slug: 'simple', new_slug: 'simple' },
								{ old_id: 6, new_id: 4, old_slug: 'variable', new_slug: 'variable' },
							],
							product_visibility: [
								{ old_id: 9, new_id: 7, old_slug: 'exclude-from-catalog', new_slug: 'exclude-from-catalog' },
								{ old_id: 8, new_id: 6, old_slug: 'exclude-from-search', new_slug: 'exclude-from-search' },
								{ old_id: 10, new_id: 8, old_slug: 'featured', new_slug: 'featured' },
								{ old_id: 11, new_id: 9, old_slug: 'outofstock', new_slug: 'outofstock' },
								{ old_id: 12, new_id: 10, old_slug: 'rated-1', new_slug: 'rated-1' },
								{ old_id: 13, new_id: 11, old_slug: 'rated-2', new_slug: 'rated-2' },
								{ old_id: 14, new_id: 12, old_slug: 'rated-3', new_slug: 'rated-3' },
								{ old_id: 15, new_id: 13, old_slug: 'rated-4', new_slug: 'rated-4' },
								{ old_id: 16, new_id: 14, old_slug: 'rated-5', new_slug: 'rated-5' },
							],
							product_cat: [
								{ old_id: 17, new_id: 15, old_slug: 'uncategorized', new_slug: 'uncategorized' },
							],
						},
					},
					content: {
						page: {
							succeed: { 236: 1654, 336: 1651, 353: 1648, 10126: 1645, 10832: 1642, 16040: 1637 },
							failed: [],
						},
						'e-floating-buttons': {
							succeed: { 649: 1696, 4201: 1692, 10141: 1688, 10146: 1684, 10377: 1676, 10381: 1680, 10612: 1668, 10616: 1672, 10847: 1663, 10851: 1658 },
							failed: [],
						},
					},
					'wp-content': {
						post: {
							succeed: [],
							failed: [],
						},
						page: {
							succeed: { 248: 1701, 15856: 1702, 16104: 1703, 19955: 1704 },
							failed: [],
						},
						product: {
							succeed: { 547: 1705 },
							failed: [],
						},
						nav_menu_item: {
							succeed: [],
							failed: [],
						},
					},
				},
			} );
			// Act
			render( <ImportComplete /> );
			// Assert
			expect( screen.getByText( '10 Pages | 1 Product | 15 Taxonomies' ) ).toBeTruthy();
		} );
	} );
} );
