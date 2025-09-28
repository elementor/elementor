import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExportComplete from 'elementor/app/modules/import-export-customization/assets/js/export/pages/export-complete';
import eventsConfig from 'elementor/core/common/modules/events-manager/assets/js/events-config';
import useContextDetection from 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-context-detection';

const mockNavigate = jest.fn();

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/shared/hooks/use-context-detection' );

jest.mock( '@reach/router', () => ( {
	useNavigate: () => mockNavigate,
} ) );

const mockSendExportKitCustomization = jest.fn();
const mockSendPageViewsWebsiteTemplates = jest.fn();
jest.mock( 'elementor/app/assets/js/event-track/apps-event-tracking', () => ( {
	AppsEventTracking: {
		sendExportKitCustomization: ( ...args ) => mockSendExportKitCustomization( ...args ),
		sendPageViewsWebsiteTemplates: ( ...args ) => mockSendPageViewsWebsiteTemplates( ...args ),
	},
} ) );

let mockExportContext = {
	data: {
		exportedData: {
			file: 'base64encodedfile',
			manifest: { version: '1.0', content: {} },
		},
		kitInfo: {
			title: 'My Test Kit',
			source: 'file',
		},
		includes: [ 'content', 'templates' ],
	},
	isCompleted: true,
};

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/export/context/export-context', () => ( {
	useExportContext: () => mockExportContext,
	ExportContextProvider: ( { children } ) => children,
} ) );

describe( 'ExportComplete Component', () => {
	let mockElementorAppConfig;
	let mockDocument;
	let mockLink;

	beforeEach( () => {
		mockExportContext = {
			data: {
				exportedData: {
					file: 'base64encodedfile',
					manifest: { version: '1.0', content: { page: {}, post: {} } },
				},
				kitInfo: {
					title: 'My Test Kit',
					source: 'file',
				},
				includes: [ 'content', 'templates' ],
			},
			isCompleted: true,
		};

		mockElementorAppConfig = {
			admin_url: 'https://example.com/wp-admin/',
			base_url: 'https://example.com/elementor',
		};

		useContextDetection.mockImplementation( () => ( {
			isImport: true,
			contextData: mockExportContext,
		} ) );

		global.elementorAppConfig = mockElementorAppConfig;

		global.elementorCommon = {
			config: {
				isRTL: false,
			},
			eventsManager: {
				config: eventsConfig,
			},
		};

		mockLink = {
			href: '',
			download: '',
			click: jest.fn(),
		};

		mockDocument = {
			createElement: jest.fn().mockReturnValue( mockLink ),
		};
		global.document = mockDocument;

		Object.defineProperty( window, 'top', {
			value: { location: '' },
			writable: true,
		} );

		mockNavigate.mockClear();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Basic Rendering', () => {
		it( 'should render file export completion page', async () => {
			render( <ExportComplete /> );

			expect( screen.getByTestId( 'export-complete-icon' ) ).toBeTruthy();
			expect( screen.getByTestId( 'export-complete-heading' ) ).toBeTruthy();
			expect( screen.getByTestId( 'export-complete-summary' ) ).toBeTruthy();
			expect( screen.getByTestId( 'export-complete-download-link' ) ).toBeTruthy();
			expect( screen.getByTestId( 'done-button' ) ).toBeTruthy();
			await waitFor( () => expect( mockSendPageViewsWebsiteTemplates ).toHaveBeenCalledWith( 'kit_export_summary' ) );
		} );

		it( 'should show Done button for file export', () => {
			render( <ExportComplete /> );

			const doneButton = screen.getByTestId( 'done-button' );
			expect( doneButton ).toBeTruthy();
		} );

		it( 'should render cloud export completion page', () => {
			mockExportContext.data.kitInfo.source = 'cloud';

			render( <ExportComplete /> );

			expect( screen.getByTestId( 'export-complete-icon' ) ).toBeTruthy();
			expect( screen.getByTestId( 'export-complete-heading' ) ).toBeTruthy();
			expect( screen.getByTestId( 'export-complete-summary' ) ).toBeTruthy();
			expect( screen.queryByTestId( 'export-complete-download-link' ) ).toBeNull();
			expect( screen.getByTestId( 'view-in-library-button' ) ).toBeTruthy();
		} );
	} );

	describe( 'User Interactions', () => {
		it( 'should handle Done button click', () => {
			render( <ExportComplete /> );

			const doneButton = screen.getByTestId( 'done-button' );
			fireEvent.click( doneButton );

			expect( window.top.location ).toBe( 'https://example.com/wp-admin/' );
		} );

		it( 'should handle View in Library button click', () => {
			mockExportContext.data.kitInfo.source = 'cloud';

			render( <ExportComplete /> );

			const viewLibraryButton = screen.getByTestId( 'view-in-library-button' );
			fireEvent.click( viewLibraryButton );

			expect( mockNavigate ).toHaveBeenCalledWith( '/kit-library/cloud' );
		} );

		it( 'should show download link for file export', () => {
			render( <ExportComplete /> );

			const downloadLink = screen.getByTestId( 'export-complete-download-link' );
			expect( downloadLink ).toBeTruthy();
		} );
	} );

	describe( 'Export Type Handling', () => {
		it( 'should not auto-download for cloud export', async () => {
			mockExportContext.data.kitInfo.source = 'cloud';

			render( <ExportComplete /> );

			await waitFor( () => {
				expect( mockDocument.createElement ).not.toHaveBeenCalled();
			} );
		} );
	} );

	describe( 'Analytics Tracking', () => {
		it( 'should track kit_post_type_count with custom post types', async () => {
			mockExportContext.data.exportedData.manifest = {
				version: '1.0',
				content: { page: {}, post: {} },
				'custom-post-type-title': {
					product: {
						name: 'product',
						label: 'Products',
					},
					event: {
						name: 'event',
						label: 'Events',
					},
				},
			};

			render( <ExportComplete /> );

			await waitFor( () => {
				expect( mockSendExportKitCustomization ).toHaveBeenCalledWith(
					expect.objectContaining( {
						kit_post_type_count: 2,
					} )
				);
			} );
		} );

		it( 'should track kit_post_type_count with all post types', async () => {
			mockExportContext.data.exportedData.manifest = {
				version: '1.0',
				content: { page: {}, post: {} },
				'custom-post-type-title': {
					product: {
						name: 'product',
						label: 'Products',
					},
					post: {
						name: 'post',
						label: 'Posts',
					},
					page: {
						name: 'page',
						label: 'Pages',
					},
				},
			};

			render( <ExportComplete /> );

			await waitFor( () => {
				expect( mockSendExportKitCustomization ).toHaveBeenCalledWith(
					expect.objectContaining( {
						kit_post_type_count: 3,
					} )
				);
			} );
		} );

		it( 'should track kit_post_type_count as 0 when custom-post-type-title is empty', async () => {
			mockExportContext.data.exportedData.manifest = {
				version: '1.0',
				content: { page: {}, post: {} },
				'custom-post-type-title': {},
			};

			render( <ExportComplete /> );

			await waitFor( () => {
				expect( mockSendExportKitCustomization ).toHaveBeenCalledWith(
					expect.objectContaining( {
						kit_post_type_count: 0,
					} )
				);
			} );
		} );

		it( 'should track kit_post_type_count as 0 when custom-post-type-title is missing', async () => {
			mockExportContext.data.exportedData.manifest = {
				version: '1.0',
				content: { page: {}, post: {} },
			};

			render( <ExportComplete /> );

			await waitFor( () => {
				expect( mockSendExportKitCustomization ).toHaveBeenCalledWith(
					expect.objectContaining( {
						kit_post_type_count: 0,
					} )
				);
			} );
		} );

		it( 'should track kit_post_type_count with multiple post types', async () => {
			mockExportContext.data.exportedData.manifest = {
				version: '1.0',
				content: { page: {}, post: {} },
				'custom-post-type-title': {
					product: {
						name: 'product',
						label: 'Products',
					},
					post: {
						name: 'post',
						label: 'Posts',
					},
					nav_menu_item: {
						name: 'nav_menu_item',
						label: 'Navigation Menu Items',
					},
					event: {
						name: 'event',
						label: 'Events',
					},
				},
			};

			render( <ExportComplete /> );

			await waitFor( () => {
				expect( mockSendExportKitCustomization ).toHaveBeenCalledWith(
					expect.objectContaining( {
						kit_post_type_count: 4,
					} )
				);
			} );
		} );

		it( 'should track kit_export_customization_modals from analytics data', async () => {
			const mockCustomization = {
				settings: 'Customized',
				templates: 'Not Customized',
				content: 'Customized',
				plugins: 'Not Customized',
			};

			mockExportContext.data.analytics = {
				customization: mockCustomization,
			};

			render( <ExportComplete /> );

			await waitFor( () => {
				expect( mockSendExportKitCustomization ).toHaveBeenCalledWith(
					expect.objectContaining( {
						kit_export_customization_modals: mockCustomization,
					} )
				);
			} );
		} );

		it( 'should track kit_export_customization_modals as undefined when analytics is missing', async () => {
			mockExportContext.data.analytics = undefined;

			render( <ExportComplete /> );

			await waitFor( () => {
				expect( mockSendExportKitCustomization ).toHaveBeenCalledWith(
					expect.objectContaining( {
						kit_export_customization_modals: undefined,
					} )
				);
			} );
		} );

		it( 'should track kit_page_count from content manifest', async () => {
			mockExportContext.data.exportedData.manifest = {
				version: '1.0',
				content: {
					page: {
						'1': { title: 'Home Page' },
						'2': { title: 'About Page' },
						'3': { title: 'Contact Page' },
					},
					post: {
						'4': { title: 'Blog Post 1' },
					},
				},
			};

			render( <ExportComplete /> );

			await waitFor( () => {
				expect( mockSendExportKitCustomization ).toHaveBeenCalledWith(
					expect.objectContaining( {
						kit_page_count: 3,
					} )
				);
			} );
		} );

		it( 'should track kit_page_count from wp-content manifest', async () => {
			mockExportContext.data.exportedData.manifest = {
				version: '1.0',
				'wp-content': {
					page: {
						'1': { title: 'Home Page' },
						'2': { title: 'About Page' },
					},
				},
			};

			render( <ExportComplete /> );

			await waitFor( () => {
				expect( mockSendExportKitCustomization ).toHaveBeenCalledWith(
					expect.objectContaining( {
						kit_page_count: 2,
					} )
				);
			} );
		} );

		it( 'should track kit_page_count combining content and wp-content', async () => {
			mockExportContext.data.exportedData.manifest = {
				version: '1.0',
				content: {
					page: {
						'1': { title: 'Home Page' },
						'2': { title: 'About Page' },
					},
				},
				'wp-content': {
					page: {
						'3': { title: 'Contact Page' },
					},
				},
			};

			render( <ExportComplete /> );

			await waitFor( () => {
				expect( mockSendExportKitCustomization ).toHaveBeenCalledWith(
					expect.objectContaining( {
						kit_page_count: 3,
					} )
				);
			} );
		} );

		it( 'should track kit_page_count as 0 when no pages exist', async () => {
			mockExportContext.data.exportedData.manifest = {
				version: '1.0',
				content: {
					post: {
						'1': { title: 'Blog Post' },
					},
				},
			};

			render( <ExportComplete /> );

			await waitFor( () => {
				expect( mockSendExportKitCustomization ).toHaveBeenCalledWith(
					expect.objectContaining( {
						kit_page_count: 0,
					} )
				);
			} );
		} );

		it( 'should track kit_post_count from content manifest', async () => {
			mockExportContext.data.exportedData.manifest = {
				version: '1.0',
				content: {
					post: {
						'1': { title: 'Blog Post 1' },
						'2': { title: 'Blog Post 2' },
						'3': { title: 'Blog Post 3' },
					},
					page: {
						'4': { title: 'Home Page' },
					},
				},
			};

			render( <ExportComplete /> );

			await waitFor( () => {
				expect( mockSendExportKitCustomization ).toHaveBeenCalledWith(
					expect.objectContaining( {
						kit_post_count: 3,
					} )
				);
			} );
		} );

		it( 'should track kit_post_count from wp-content manifest', async () => {
			mockExportContext.data.exportedData.manifest = {
				version: '1.0',
				'wp-content': {
					post: {
						'1': { title: 'Blog Post 1' },
						'2': { title: 'Blog Post 2' },
					},
				},
			};

			render( <ExportComplete /> );

			await waitFor( () => {
				expect( mockSendExportKitCustomization ).toHaveBeenCalledWith(
					expect.objectContaining( {
						kit_post_count: 2,
					} )
				);
			} );
		} );

		it( 'should track kit_post_count combining content and wp-content', async () => {
			mockExportContext.data.exportedData.manifest = {
				version: '1.0',
				content: {
					post: {
						'1': { title: 'Blog Post 1' },
						'2': { title: 'Blog Post 2' },
					},
				},
				'wp-content': {
					post: {
						'3': { title: 'Blog Post 3' },
						'4': { title: 'Blog Post 4' },
					},
				},
			};

			render( <ExportComplete /> );

			await waitFor( () => {
				expect( mockSendExportKitCustomization ).toHaveBeenCalledWith(
					expect.objectContaining( {
						kit_post_count: 4,
					} )
				);
			} );
		} );

		it( 'should track kit_post_count as 0 when no posts exist', async () => {
			mockExportContext.data.exportedData.manifest = {
				version: '1.0',
				content: {
					page: {
						'1': { title: 'Home Page' },
					},
				},
			};

			render( <ExportComplete /> );

			await waitFor( () => {
				expect( mockSendExportKitCustomization ).toHaveBeenCalledWith(
					expect.objectContaining( {
						kit_post_count: 0,
					} )
				);
			} );
		} );
	} );
} );
