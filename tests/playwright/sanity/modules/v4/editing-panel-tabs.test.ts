import WpAdminPage from '../../../pages/wp-admin-page';
import { parallelTest as test } from '../../../parallelTest';
import { BrowserContext, expect } from '@playwright/test';
import EditorPage from '../../../pages/editor-page';

test.describe( 'Editing panel tabs @v4-tests', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;

	const atomicWidget = { name: 'e-heading', title: 'Heading' };
	const experimentName = 'e_atomic_elements';
	const panelSelector = '#elementor-panel-inner';

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		const page = await context.newPage();

		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { [ experimentName ]: 'active' } );

		editor = await wpAdmin.openNewPage();
	} );

	test.afterAll( async () => {
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	test( 'should hide tabs header when scrolling down in the panel', async () => {
		await openScrollableStylePanel();

		const lastSection = editor.page.locator( '.MuiButtonBase-root', { hasText: /effects/i } );
		await lastSection.scrollIntoViewIfNeeded();

		await expect.soft( editor.page.locator( panelSelector ) ).toHaveScreenshot( 'editing-panel-scrolling-down.png' );
	} );

	test( 'should display tabs header when scrolling back up', async () => {
		await openScrollableStylePanel();

		const firstSection = editor.page.locator( '.MuiButtonBase-root', { hasText: /layout/i } );
		await firstSection.scrollIntoViewIfNeeded();

		await expect.soft( editor.page.locator( panelSelector ) ).toHaveScreenshot( 'editing-panel-scrolling-up.png' );
	} );

	test( 'should maintain header tabs visibility during inner component scrolling', async () => {
		await editor.openV2PanelTab( 'general' );
		await editor.openV2PanelTab( 'style' );

		await editor.openV2Section( 'typography' );

		await editor.page.locator( 'div.MuiGrid-container' ).filter( {
			has: editor.page.locator( 'label', { hasText: 'Font family' } ),
		} ).locator( '[role="button"]' ).click();

		await editor.page.getByText( 'Google Fonts' ).scrollIntoViewIfNeeded();

		await expect.soft( editor.page.locator( panelSelector ) ).toHaveScreenshot( 'editing-panel-inner-scrolling.png' );
	} );

	async function openScrollableStylePanel() {
		const panel = editor.page.locator( '#elementor-panel-category-v4-elements' );
		await panel.isVisible();

		await editor.addWidget( { widgetType: atomicWidget.name } );
		await editor.openV2PanelTab( 'style' );
		await editor.openV2Section( 'size' );
		await editor.openV2Section( 'typography' );
	}
} );
