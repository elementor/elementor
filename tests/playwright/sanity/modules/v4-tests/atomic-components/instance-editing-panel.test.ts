import { expect, type BrowserContext, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import EditorSelectors from '../../../../selectors/editor-selectors';
import {
	addBasicInstanceToCanvas,
	addVideoInstanceToCanvas,
	createBasicComponent,
	createVideoComponent,
	getComponentByName,
} from './utils/instance-panel';

const BASIC_COMPONENT_NAME = 'E2E - Instance Panel Basic';
const VIDEO_COMPONENT_NAME = 'E2E - Instance Panel Dependencies';

test.describe( 'Instance Editing Panel @v4-tests', () => {
	let wpAdminPage: WpAdminPage;
	let editor: EditorPage;
	let context: BrowserContext;
	let page: Page;
	let basicComponentId: number;
	let videoComponentId: number;

	const proMockScript = `<script>window.elementorPro = { config: { isActive: true, version: '3.35.0' } };</script>`;

	const enableProMock = async () => {
		await page.route(
			( url: URL ) => 'elementor' === url.searchParams.get( 'action' ),
			async ( route ) => {
				const response = await route.fetch();
				const contentType = response.headers()[ 'content-type' ] ?? '';

				if ( ! contentType.includes( 'text/html' ) ) {
					await route.fulfill( { response } );
					return;
				}

				const html = await response.text();
				await route.fulfill( {
					response,
					body: html.replace( '<head>', `<head>${ proMockScript }` ),
				} );
			},
		);
	};

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdminPage.setExperiments( { e_atomic_elements: 'active' } );
		await page.waitForLoadState( 'domcontentloaded' );

		const existingBasic = await getComponentByName( page, BASIC_COMPONENT_NAME );
		basicComponentId = existingBasic?.id ?? await createBasicComponent( page, BASIC_COMPONENT_NAME );

		const existingVideo = await getComponentByName( page, VIDEO_COMPONENT_NAME );
		videoComponentId = existingVideo?.id ?? await createVideoComponent( page, VIDEO_COMPONENT_NAME );
	} );

	test.beforeEach( async () => {
		await enableProMock();
		editor = await wpAdminPage.openNewPage();
	} );

	test.afterAll( async () => {
		await wpAdminPage?.resetExperiments();
		await context?.close();
	} );

	test.describe( 'Basic cases', () => {
		test( 'should open instance editing panel when clicking component instance on canvas', async () => {
			let instanceId: string;

			await test.step( 'Add component instance to canvas', async () => {
				instanceId = await addBasicInstanceToCanvas( page, editor, basicComponentId );
			} );

			await test.step( 'Select component instance', async () => {
				await editor.selectElement( instanceId );
			} );

			await test.step( 'Instance editing panel is visible', async () => {
				const panel = page.locator( EditorSelectors.components.instanceEditingPanel );
				await expect( panel ).toBeVisible();
			} );
		} );

		test( 'should display overridable props with their labels in the instance editing panel', async () => {
			let instanceId: string;

			await test.step( 'Add component instance to canvas', async () => {
				instanceId = await addBasicInstanceToCanvas( page, editor, basicComponentId );
			} );

			await test.step( 'Select component instance', async () => {
				await editor.selectElement( instanceId );
			} );

			await test.step( 'Overridable prop label is visible in panel', async () => {
				const panel = page.locator( EditorSelectors.components.instanceEditingPanel );
				await expect( panel.getByText( 'Title' ) ).toBeVisible();
			} );
		} );
	} );

	test.describe( 'Dependencies', () => {
		test( 'should hide dependent overridable prop when dependency condition is met at component level', async () => {
			let instanceId: string;

			await test.step( 'Add video component instance to canvas', async () => {
				instanceId = await addVideoInstanceToCanvas( page, editor, videoComponentId );
			} );

			await test.step( 'Select component instance', async () => {
				await editor.selectElement( instanceId );
			} );

			await test.step( 'Allow Download prop is not visible in instance editing panel (hidden by dependency)', async () => {
				const panel = page.locator( EditorSelectors.components.instanceEditingPanel );
				await expect( panel.getByText( 'Allow Download' ) ).toBeHidden();
			} );
		} );
	} );
} );
