import { BrowserContext, expect, Page } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import EditorSelectors from '../../../../selectors/editor-selectors';

import { createComponent, createContentForComponent, createOverridableProp, uniqueName, waitForAutosave } from './utils/creation';

test.describe( 'Override Prop Control @v4-tests', () => {
	let wpAdminPage: WpAdminPage;
	let editor: EditorPage;
	let context: BrowserContext;
	let page: Page;

	const proMockScript = `<script>window.elementorPro = { config: { isActive: true, version: '3.35.0' } };</script>`;

	const proMockRouteHandler = async ( route: import( '@playwright/test' ).Route ) => {
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
	};

	const proMockRoutePattern = ( url: URL ) => 'elementor' === url.searchParams.get( 'action' );

	const enableProMock = async () => {
		await page.route( proMockRoutePattern, proMockRouteHandler );
	};

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdminPage.setExperiments( {
			e_atomic_elements: 'active',
			e_components: 'active',
		} );
	} );

	test.afterAll( async () => {
		await wpAdminPage?.resetExperiments();
		await context?.close();
	} );

	test.beforeEach( async () => {
		await enableProMock();
		editor = await wpAdminPage.openNewPage();
	} );

	test( 'should display override control with origin value and update it', async () => {
		const componentName = uniqueName( 'Override Test' );

		let instanceId: string;

		await test.step( 'Create a component with a heading and expose the title prop', async () => {
			const { locator: flexbox } = await createContentForComponent( editor );

			await flexbox.click( { button: 'right' } );
			await page.waitForSelector( EditorSelectors.contextMenu.menu );
			const createItem = page.getByRole( 'menuitem', { name: 'Create component' } );
			await createItem.click();

			instanceId = await createComponent( page, editor, componentName );

			const headingControl = page.locator( '[data-setting="tag"]' ).first();
			await expect( headingControl ).toBeVisible();

			await createOverridableProp( page, 'Heading Tag' );
		} );

		await test.step( 'Exit component edit mode', async () => {
			const exitButton = page.locator( EditorSelectors.components.exitEditModeButton );
			await exitButton.click();
			await waitForAutosave( page );
		} );

		await test.step( 'Select the instance and verify override control shows origin value', async () => {
			await editor.selectElement( instanceId );

			const instancePanel = page.locator( EditorSelectors.components.instanceEditingPanel );
			await expect( instancePanel ).toBeVisible();

			const overrideControl = instancePanel.locator( 'label' ).filter( { hasText: 'Heading Tag' } );
			await expect( overrideControl ).toBeVisible();
		} );
	} );
} );
