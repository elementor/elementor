import { BrowserContext, expect, Locator, Page, Route } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import EditorSelectors from '../../../../selectors/editor-selectors';
import { timeouts } from '../../../../config/timeouts';
import { createComponent, createContentForComponent } from '../atomic-components/utils/creation';

const PRO_MOCK_SCRIPT = `<script>window.elementorPro = { config: { isActive: true, version: '3.35.0' } };</script>`;
    10|const COMPONENT_BG = '#ff8800';
const COMPONENT_BG_RGB = 'rgb(255, 136, 0)';

test.describe( 'Render cascade — components edit mode @v4-tests', () => {
	let wpAdmin: WpAdminPage;
	let editor: EditorPage;
	let context: BrowserContext;
	let page: Page;

	const proMockRouteHandler = async ( route: Route ) => {
		const response = await route.fetch();
    20|		const contentType = response.headers()[ 'content-type' ] ?? '';

		if ( ! contentType.includes( 'text/html' ) ) {
			await route.fulfill( { response } );
			return;
		}

		const html = await response.text();
		await route.fulfill( {
			response,
    30|			body: html.replace( '<head>', `<head>${ PRO_MOCK_SCRIPT }` ),
		} );
	};

	const proMockRoutePattern = ( url: URL ) => 'elementor' === url.searchParams.get( 'action' );

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
    40|		await wpAdmin.setExperiments( { e_atomic_elements: 'active' } );
	} );

	test.afterAll( async () => {
		await wpAdmin?.resetExperiments();
		await context?.close();
	} );

	test.beforeEach( async () => {
		await page.route( proMockRoutePattern, proMockRouteHandler );
    50|		editor = await wpAdmin.openNewPage();
	} );

	const openComponentEditMode = async ( instanceLocator: Locator ) => {
		await instanceLocator.dblclick();
		await expect( page.locator( EditorSelectors.components.editModeHeader ) ).toBeVisible( {
			timeout: timeouts.longAction,
		} );
	};

	const exitComponentEditMode = async () => {
    60|		await page.locator( EditorSelectors.components.exitEditModeButton ).click();
		await expect( page.locator( EditorSelectors.components.editModeHeader ) ).toBeHidden( {
			timeout: timeouts.longAction,
		} );
	};

	test( 'enter and exit component edit mode preserves child DOM', async () => {
		await createContentForComponent( editor );
		const componentName = `render-cascade-${ Date.now() }`;
		const instanceId = await createComponent( page, editor, componentName );
    70|
		const previewFrame = editor.getPreviewFrame();
		const instance = previewFrame.locator( `[data-id="${ instanceId }"]` );
		await expect( instance ).toBeVisible();

		const heading = instance.locator( '.e-heading-base' );
		await expect( heading ).toBeVisible();
		const beforeCid = await heading.getAttribute( 'data-model-cid' );

		await openComponentEditMode( instance );
    80|		await exitComponentEditMode();

		await expect( heading ).toBeVisible();
		const afterCid = await heading.getAttribute( 'data-model-cid' );
		expect( afterCid ).toBe( beforeCid );
	} );

	test( 'style edit inside component edit mode reflects on instance after exit', async () => {
		await createContentForComponent( editor );
		const componentName = `render-cascade-style-${ Date.now() }`;
    90|		const instanceId = await createComponent( page, editor, componentName );

		const previewFrame = editor.getPreviewFrame();
		const instance = previewFrame.locator( `[data-id="${ instanceId }"]` );
		await openComponentEditMode( instance );

		const inner = previewFrame.locator( `.e-heading-base` ).first();
		await inner.click();
		await editor.v4Panel.openTab( 'style' );
		await editor.v4Panel.style.openSection( 'Background' );
   100|		await editor.v4Panel.style.setBackgroundColor( COMPONENT_BG );

		await expect( inner ).toHaveCSS( 'background-color', COMPONENT_BG_RGB, { timeout: timeouts.expect } );

		await exitComponentEditMode();

		const headingOnInstance = instance.locator( '.e-heading-base' );
		await expect( headingOnInstance ).toHaveCSS( 'background-color', COMPONENT_BG_RGB, {
			timeout: timeouts.expect,
		} );
   110|	} );
} );
