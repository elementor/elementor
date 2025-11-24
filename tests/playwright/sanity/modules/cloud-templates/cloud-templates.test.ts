import { expect, Page, TestInfo } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import ApiRequests from '../../../assets/api-requests';

declare global {
	interface Window {
		elementor?: {
			config?: {
				user?: {
					capabilities?: string[];
				};
				library_connect?: {
					is_connected?: boolean;
				};
			};
		};
		ElementorConfig?: {
			nonce?: string;
		};
	}
}

const cloudTemplatesMock = {
	templates: {
		templates: [
			{
				template_id: 1197,
				source: 'cloud',
				type: 'folder',
				subType: 'FOLDER',
				title: 'Design Resources',
				status: 'active',
				author: 'designer@example.com',
				human_date: 'October 21, 2025',
				export_link: 'export-link-abc123xyz',
				hasPageSettings: false,
				parentId: null,
				preview_url: '',
				generate_preview_url: '',
			},
			{
				template_id: 1311,
				source: 'cloud',
				type: 'page',
				subType: 'TEMPLATE',
				title: 'Modern Landing Page',
				status: 'active',
				author: 'developer@testmail.com',
				human_date: 'November 14, 2025',
				export_link: 'https://example.com/export/template-1311',
				hasPageSettings: true,
				parentId: null,
				preview_url: '',
				generate_preview_url: '',
			},
			{
				template_id: 1302,
				source: 'cloud',
				type: 'page',
				subType: 'TEMPLATE',
				title: 'Business Portfolio',
				status: 'active',
				author: 'creator@sample.org',
				human_date: 'November 11, 2025',
				export_link: 'random-export-string-789def',
				hasPageSettings: true,
				parentId: null,
				preview_url: '',
				generate_preview_url: '',
			},
			{
				template_id: 1298,
				source: 'cloud',
				type: 'page',
				subType: 'TEMPLATE',
				title: 'E-commerce Homepage',
				status: 'active',
				author: 'builder@demo.io',
				human_date: 'November 11, 2025',
				export_link: 'template-export-456ghi',
				hasPageSettings: true,
				parentId: null,
				preview_url: '',
				generate_preview_url: '',
			},
		],
		total: 4,
	},
	config: {
		block: {
			categories: [
				'about',
				'archive',
				'contact',
				'ehp-footer',
				'ehp-header',
				'header',
				'hero',
				'Link in Bio',
				'404 page',
			],
			sets: [
				'Boxing Club',
				'Business Consultant',
				'Workshop Center',
			],
		},
		popup: {
			categories: [
				'fly-in',
				'slide-in',
			],
		},
		lp: {
			categories: [
				'Events',
			],
		},
		lb: {
			categories: [
				'post',
				'product',
			],
		},
	},
};

test.describe( 'Cloud Templates', () => {
	const mockCloudTemplatesRoute = async ( page: Page, mockedResponse = cloudTemplatesMock ) => {
		// Match the API route for cloud templates
		await page.route( ( url ) => {
			return url.pathname.includes( '/wp-json/elementor/v1/template-library/templates' ) &&
				'cloud' === url.searchParams.get( 'source' );
		}, async ( route ) => {
			await route.fulfill( {
				status: 200,
				contentType: 'application/json',
				json: mockedResponse,
			} );
		} );
	};

	type AdminAjaxPredicate = ( actions: Record< string, { action: string; data: Record< string, unknown > } > ) => boolean;

	const mockAdminAjaxCall = async ( page: Page, predicate: AdminAjaxPredicate, mockResponse: unknown ) => {
		await page.route( '/wp-admin/admin-ajax.php', async ( route ) => {
			const request = route.request();
			const postDataJSON = request.postDataJSON();

			if ( 'POST' === request.method() && postDataJSON?.actions ) {
				try {
					const actions = JSON.parse( postDataJSON.actions );

					if ( predicate( actions ) ) {
						await route.fulfill( {
							status: 200,
							contentType: 'application/json',
							json: mockResponse,
						} );
						return;
					}
				} catch {}
			}

			await route.continue();
		} );
	};

	const mockTemplatesQuotaRoute = async ( page: Page ) => {
		await mockAdminAjaxCall(
			page,
			( actions ) => {
				const { action, data } = actions?.get_templates_quota || {};
				return 'get_templates_quota' === action && 'cloud' === data?.source;
			},
			{
				success: true,
				data: {
					responses: {
						get_templates_quota: {
							success: true,
							code: 200,
							data: {
								currentUsage: 500,
								threshold: 1000,
								subscriptionId: 'fakeId',
							},
						},
					},
				},
			},
		);
	};

	const mockRenameTemplateRoute = async ( page: Page, templateId: number, mockResponse: unknown ) => {
		await mockAdminAjaxCall(
			page,
			( actions ) => {
				const { action, data } = actions?.rename_template || {};
				return 'rename_template' === action && 'cloud' === data?.source && templateId === data?.id;
			},
			mockResponse,
		);
	};

	const mockConnect = ( page: Page ) => {
		return page.evaluate( () => {
			if ( typeof window.elementor !== 'undefined' && window.elementor.config ) {
				if ( ! window.elementor.config.library_connect ) {
					window.elementor.config.library_connect = {};
				}
				window.elementor.config.library_connect.is_connected = true;
			}
		} );
	};

	const setupCloudTemplatesTab = async ( page: Page, testInfo: TestInfo, apiRequests: ApiRequests ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await mockCloudTemplatesRoute( page );
		await mockTemplatesQuotaRoute( page );

		const previewFrame = editor.getPreviewFrame();

		await previewFrame.waitForSelector( '.elementor-add-section-inner', { timeout: 10000 } );

		await mockConnect( page );

		const folderButton = previewFrame.locator( '.elementor-add-template-button' );
		await expect( folderButton ).toBeVisible();
		await folderButton.click();

		await page.waitForSelector( '#elementor-template-library-modal' );

		const templatesTab = page.locator( '[data-tab="templates/my-templates"]', { hasText: 'Templates' } );
		await expect( templatesTab ).toBeVisible();
		await templatesTab.click();
		await page.waitForTimeout( 500 );

		const cloudTemplatesButton = page.locator( '[data-source="cloud"]' );
		await expect( cloudTemplatesButton ).toBeVisible();

		const responsePromise = page.waitForResponse( ( response ) => {
			return response.url().includes( '/wp-json/elementor/v1/template-library/templates' ) &&
				response.url().includes( 'source=cloud' );
		} );

		await cloudTemplatesButton.click();

		await responsePromise;

		await page.waitForSelector( '#elementor-template-library-templates-container' );

		await page.waitForSelector( '.elementor-template-library-template-cloud' );
	};

	test( 'should display cloud templates list and grid view correctly', async ( { page, apiRequests }, testInfo ) => {
		await setupCloudTemplatesTab( page, testInfo, apiRequests );

		const templateItems = page.locator( '.elementor-template-library-template-cloud' );
		await expect( templateItems ).toHaveCount( 4 );

		await page.pause();

		// Verify specific template titles are present
		await expect( page.locator( 'text=Design Resources' ).first() ).toBeVisible();
		await expect( page.locator( 'text=Modern Landing Page' ).first() ).toBeVisible();
		await expect( page.locator( 'text=Business Portfolio' ).first() ).toBeVisible();
		await expect( page.locator( 'text=E-commerce Homepage' ).first() ).toBeVisible();

		const modal = page.locator( '#elementor-template-library-modal .dialog-widget-content' );

		expect( await modal.screenshot( { type: 'jpeg' } ) ).toMatchSnapshot( 'cloud-templates-list-view.jpeg' );

		const gridViewBtn = page.locator( '#elementor-template-library-view-grid' );

		await gridViewBtn.click();

		expect( await modal.screenshot( { type: 'jpeg' } ) ).toMatchSnapshot( 'cloud-templates-grid-view.jpeg' );
	} );

	test.only( 'should rename cloud template', async ( { page, apiRequests }, testInfo ) => {
		await setupCloudTemplatesTab( page, testInfo, apiRequests );

		const templateItems = page.locator( '.elementor-template-library-template-cloud' );

		const { template_id: id, type, subType, title } = cloudTemplatesMock.templates.templates[ 1 ];
		const newTitle = 'Renamed Template Test';

		const renameMockResponse = {
			success: true,
			data: {
				responses: {
					rename_template: {
						success: true,
						code: 200,
						data: {
							id,
							title: newTitle,
							type,
							templateType: subType,
							content: '',
						},
					},
				},
			},
		};

		await mockRenameTemplateRoute( page, id, renameMockResponse );

		const pageTemplateRow = templateItems.filter( { hasText: title } ).first();
		const moreToggleButton = pageTemplateRow.locator( '.elementor-template-library-template-more-toggle' );
		await moreToggleButton.click();

		const contextMenu = pageTemplateRow.locator( '.elementor-template-library-template-more' );
		await expect( contextMenu ).toBeVisible();

		const renameOption = contextMenu.locator( '.elementor-template-library-template-rename' );
		await renameOption.click();

		const renameInput = page.locator( '#elementor-rename-template-dialog__input' );
		await expect( renameInput ).toBeVisible();

		await renameInput.fill( newTitle );

		const renameResponsePromise = page.waitForResponse( ( response ) => {
			return response.url().includes( '/wp-admin/admin-ajax.php' );
		} );

		const renameButton = page.locator( '.dialog-button.dialog-ok.dialog-confirm-ok', { hasText: 'Rename' } );
		await renameButton.click();

		await renameResponsePromise;

		await expect( page.locator( `text=${ newTitle }` ).first() ).toBeVisible();
	} );
} );

