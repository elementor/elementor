import { expect, Page, TestInfo } from '@playwright/test';
import { Page as PWPage } from 'playwright-core';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import ApiRequests from '../../../assets/api-requests';
import AxeBuilder from '@axe-core/playwright';

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

	type AdminAjaxPredicate = ( actions: Record<string, { action: string; data: Record<string, unknown> }> ) => boolean;

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
				} catch { }
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

	const mockDeleteTemplateRoute = async ( page: Page, templateId: number, mockResponse: unknown ) => {
		await mockAdminAjaxCall(
			page,
			( actions ) => {
				const { action, data } = actions?.delete_template || {};
				return 'delete_template' === action && 'cloud' === data?.source && templateId === data?.template_id;
			},
			mockResponse,
		);
	};

	const mockCreateFolderRoute = async ( page: Page, folderTitle: string, mockResponse: unknown ) => {
		await mockAdminAjaxCall(
			page,
			( actions ) => {
				const { action, data } = actions?.create_folder || {};
				return 'create_folder' === action && 'cloud' === data?.source && folderTitle === data?.title;
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

	const mockSaveTemplateRoute = async ( page: Page, templateTitle: string, mockResponse: unknown ) => {
		await mockAdminAjaxCall(
			page,
			( actions ) => {
				const { action, data } = actions?.save_template || {};
				return 'save_template' === action &&
					Array.isArray( data.source ) &&
					'cloud' === data?.source[ 0 ] &&
					templateTitle === data?.title;
			},
			mockResponse,
		);
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
		await folderButton.click();

		await page.waitForSelector( '#elementor-template-library-modal' );

		const templatesTab = page.locator( '[data-tab="templates/my-templates"]', { hasText: 'Templates' } );
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

	test( 'should rename cloud template', async ( { page, apiRequests }, testInfo ) => {
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

	test( 'should delete cloud template', async ( { page, apiRequests }, testInfo ) => {
		await setupCloudTemplatesTab( page, testInfo, apiRequests );

		const templateItems = page.locator( '.elementor-template-library-template-cloud' );
		await expect( templateItems ).toHaveCount( 4 );

		const { template_id: id, title } = cloudTemplatesMock.templates.templates[ 1 ];

		const deleteMockResponse = {
			success: true,
			data: {
				responses: {
					delete_template: {
						success: true,
						code: 200,
						data: true,
					},
				},
			},
		};

		await mockDeleteTemplateRoute( page, id, deleteMockResponse );

		const pageTemplateRow = templateItems.filter( { hasText: title } ).first();
		const moreToggleButton = pageTemplateRow.locator( '.elementor-template-library-template-more-toggle' );
		await moreToggleButton.click();

		const contextMenu = pageTemplateRow.locator( '.elementor-template-library-template-more' );

		const deleteOption = contextMenu.locator( '.elementor-template-library-template-delete' );
		await deleteOption.click();

		const confirmDialog = page.locator( '.dialog-message.dialog-confirm-message' );
		await expect( confirmDialog ).toContainText( `This will permanently remove "${ title }".` );

		const deleteResponsePromise = page.waitForResponse( ( response ) => {
			return response.url().includes( '/wp-admin/admin-ajax.php' );
		} );

		const confirmDeleteButton = page.locator( '.dialog-confirm-ok', { hasText: 'Delete' } );
		await confirmDeleteButton.click();

		await deleteResponsePromise;

		await expect( templateItems.filter( { hasText: title } ) ).toHaveCount( 0 );
		await expect( templateItems ).toHaveCount( 3 );
	} );

	test( 'should create new folder', async ( { page, apiRequests }, testInfo ) => {
		await setupCloudTemplatesTab( page, testInfo, apiRequests );

		const folderTitle = 'TEST';
		const folderId = 1314;

		const createFolderMockResponse = {
			success: true,
			data: {
				responses: {
					create_folder: {
						success: true,
						code: 200,
						data: folderId,
					},
				},
			},
		};

		await mockCreateFolderRoute( page, folderTitle, createFolderMockResponse );

		const addNewFolderButton = page.locator( '#elementor-template-library-add-new-folder' );
		await addNewFolderButton.click();

		const folderInput = page.getByRole( 'textbox', { name: 'Folder name' } );
		await folderInput.fill( folderTitle );

		const createResponsePromise = page.waitForResponse( ( response ) => {
			return response.url().includes( '/wp-admin/admin-ajax.php' );
		} );

		const createButton = page.locator( '.dialog-confirm-ok', { hasText: 'Create' } );
		await createButton.click();

		const updatedTemplatesMock = {
			templates: {
				templates: [
					cloudTemplatesMock.templates.templates[ 0 ],
					{
						template_id: folderId,
						source: 'cloud',
						type: 'folder',
						subType: 'FOLDER',
						title: folderTitle,
						status: 'active',
						author: 'test@example.com',
						human_date: new Date().toLocaleDateString( 'en-US', { year: 'numeric', month: 'long', day: 'numeric' } ),
						export_link: `export-link-${ folderId }`,
						hasPageSettings: false,
						parentId: null,
						preview_url: '',
						generate_preview_url: '',
					},
					...cloudTemplatesMock.templates.templates.slice( 1 ),
				],
				total: 5,
			},
			config: cloudTemplatesMock.config,
		};

		const templatesRefreshPromise = page.waitForResponse( ( response ) => {
			return response.url().includes( '/wp-json/elementor/v1/template-library/templates' ) &&
				response.url().includes( 'source=cloud' );
		} );

		await createResponsePromise;

		await mockCloudTemplatesRoute( page, updatedTemplatesMock );

		await templatesRefreshPromise;

		const templateItems = page.locator( '.elementor-template-library-template-cloud' );

		await expect( templateItems ).toHaveCount( 5 );
		await expect( templateItems.nth( 1 ) ).toContainText( folderTitle );
	} );

	test( 'should save template to cloud', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await mockTemplatesQuotaRoute( page );
		await mockConnect( page );

		const getQuotaResponse = page.waitForResponse( ( response ) => {
			return response.url().includes( '/wp-admin/admin-ajax.php' );
		} );
		const previewFrame = editor.getPreviewFrame();
		await previewFrame.waitForSelector( '.elementor-add-section-inner', { timeout: 10000 } );

		const arrowButton = page.locator( 'button[aria-label="Save Options"]' ).first();
		await arrowButton.click();

		const saveAsTemplateMenuItem = page.getByRole( 'menuitem', { name: 'Save as Template' } );
		await expect( saveAsTemplateMenuItem ).toBeVisible();
		await saveAsTemplateMenuItem.click();
		await getQuotaResponse;

		const templateTitle = 'My Saved Template';
		const templateId = 2000;

		const saveTemplateMockResponse = {
			success: true,
			data: {
				responses: {
					save_template: {
						success: true,
						code: 200,
						data: {
							template_id: templateId,
							source: 'cloud',
							type: 'page',
							subType: 'TEMPLATE',
							title: templateTitle,
							status: 'active',
							author: 'test@example.com',
							human_date: new Date().toLocaleDateString( 'en-US', { year: 'numeric', month: 'long', day: 'numeric' } ),
							export_link: `export-link-${ templateId }`,
							hasPageSettings: true,
							parentId: null,
							preview_url: '',
							generate_preview_url: '',
						},
					},
				},
			},
		};

		await mockSaveTemplateRoute( page, templateTitle, saveTemplateMockResponse );

		const templateNameInput = page.locator( '#elementor-template-library-save-template-name' );
		await expect( templateNameInput ).toBeVisible();
		await templateNameInput.fill( templateTitle );

		const cloudTemplatesCheckbox = page.locator( '.source-selections-input.cloud input[type="checkbox"]' );
		await cloudTemplatesCheckbox.check();

		const saveResponsePromise = page.waitForResponse( ( response ) => {
			return response.url().includes( '/wp-admin/admin-ajax.php' );
		} );

		const saveButton = page.locator( '#elementor-template-library-save-template-submit' );
		await saveButton.click();

		await saveResponsePromise;

		const updatedTemplatesMock = {
			templates: {
				templates: [
					{
						template_id: templateId,
						source: 'cloud',
						type: 'page',
						subType: 'TEMPLATE',
						title: templateTitle,
						status: 'active',
						author: 'test@example.com',
						human_date: new Date().toLocaleDateString( 'en-US', { year: 'numeric', month: 'long', day: 'numeric' } ),
						export_link: `export-link-${ templateId }`,
						hasPageSettings: true,
						parentId: null,
						preview_url: '',
						generate_preview_url: '',
					},
				],
				total: 1,
			},
			config: cloudTemplatesMock.config,
		};

		const templatesRefreshPromise = page.waitForResponse( ( response ) => {
			return response.url().includes( '/wp-json/elementor/v1/template-library/templates' ) &&
				response.url().includes( 'source=cloud' );
		} );

		await mockCloudTemplatesRoute( page, updatedTemplatesMock );

		await templatesRefreshPromise;

		await page.waitForSelector( '.elementor-template-library-template-cloud' );
		const templateItems = page.locator( '.elementor-template-library-template-cloud' );
		await expect( templateItems ).toHaveCount( 1 );
		await expect( templateItems.first() ).toContainText( templateTitle );
	} );

	test( 'should pass accessibility test for cloud-templates popup', async ( { page, apiRequests }, testInfo ) => {
		await setupCloudTemplatesTab( page, testInfo, apiRequests );

		const accessibilityScanResults = await new AxeBuilder( { page: page as PWPage } ).include( '#elementor-template-library-modal' ).analyze();
		expect.soft( accessibilityScanResults.violations ).toEqual( [] );
	} );
} );
