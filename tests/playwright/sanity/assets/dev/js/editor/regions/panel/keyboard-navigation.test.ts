import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../../../../parallelTest';
import WpAdminPage from '../../../../../../../pages/wp-admin-page';
import EditorSelectors from '../../../../../../../selectors/editor-selectors';

const PANEL_FOCUS = '#elementor-panel-inner :focus';
const V4_SETTINGS_TAB = '[id^="tabpanel-"][id$="-settings"]';

test.describe( 'Panel keyboard navigation @v4-tests', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await ( await browser.newContext() ).newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.setExperiments( {
			e_opt_in_v4: 'active',
			e_atomic_elements: 'active',
		} );

		await page.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await ( await browser.newContext() ).newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Escape releases a V4 control without leaving the editing panel', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await test.step( 'Setup a V4 button widget', async () => {
			await editor.closeNavigatorIfOpen();
			const container = await editor.addElement( { elType: 'container' }, 'document' );
			await editor.addWidget( { widgetType: 'e-button', container } );
			await editor.v4Panel.openTab( 'general' );
		} );

		const urlInput = page.getByPlaceholder( 'Type or paste your URL' );

		await test.step( 'Focus the link control', async () => {
			if ( ! await urlInput.isVisible() ) {
				await page.locator( '[aria-label="Toggle link"]' ).click();
			}

			await urlInput.click();
			await expect( urlInput ).toBeFocused();
		} );

		await test.step( 'Escape blurs the control and keeps the editing panel open', async () => {
			await page.keyboard.press( 'Escape' );

			await expect( urlInput ).not.toBeFocused();
			await expect( page.locator( EditorSelectors.panels.elements.wrapper ) ).toBeHidden();
			await expect( page.locator( V4_SETTINGS_TAB ) ).toBeVisible();
			await expect( page.locator( PANEL_FOCUS ) ).toHaveCount( 1 );
		} );

		await test.step( 'Tab moves on to the next control instead of back into the field', async () => {
			await page.keyboard.press( 'Tab' );

			await expect( urlInput ).not.toBeFocused();
			await expect( page.locator( PANEL_FOCUS ) ).toHaveCount( 1 );
		} );
	} );

	test( 'Escape releases a legacy control without leaving the editing panel', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await test.step( 'Setup a legacy heading widget', async () => {
			await editor.closeNavigatorIfOpen();
			const container = await editor.addElement( { elType: 'container' }, 'document' );
			await editor.addWidget( { widgetType: 'heading', container } );
		} );

		const titleControl = page.locator( '.elementor-control.elementor-control-title' );
		const titleInput = titleControl.locator( 'textarea' );

		await test.step( 'Focus the title control', async () => {
			await titleInput.click();
			await expect( titleInput ).toBeFocused();
		} );

		await test.step( 'Escape blurs the control and keeps the editing panel open', async () => {
			await page.keyboard.press( 'Escape' );

			await expect( titleInput ).not.toBeFocused();
			await expect( page.locator( '#elementor-panel-page-editor' ) ).toBeVisible();
			await expect( page.locator( EditorSelectors.panels.elements.wrapper ) ).toBeHidden();
			await expect( titleControl ).toBeFocused();
		} );

		await test.step( 'Tab moves on to the next control instead of back into the field', async () => {
			await page.keyboard.press( 'Tab' );

			await expect( titleInput ).not.toBeFocused();
			await expect( page.locator( PANEL_FOCUS ) ).toHaveCount( 1 );
		} );

		await test.step( 'Escaping twice from a field exits the editing panel as usual', async () => {
			await titleInput.click();
			await page.keyboard.press( 'Escape' );
			await expect( titleControl ).toBeFocused();

			await page.keyboard.press( 'Escape' );

			await expect( page.locator( '#elementor-panel-page-editor' ) ).toBeHidden();
		} );
	} );
} );
