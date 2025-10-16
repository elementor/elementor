import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';

test.describe( 'Icon widget tests', () => {
	test( 'Icon widget sanity test', async ( { page, apiRequests }, testInfo ) => {
		const getComputedStyle = async ( element, pseudo: string ) => page.evaluate( ( [ e, p ] ) => getComputedStyle( e, p ), [ element, pseudo ] );

		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		await editor.addWidget( { widgetType: 'icon' } );
		let icon = await editor.getPreviewFrame().waitForSelector( 'i.fa-star' );
		let style = await getComputedStyle( icon, 'before' );
		expect( style.content.charCodeAt() ).toBe( 34 );

		await page.click( '.elementor-control-media__preview' );
		await page.click( '.elementor-icons-manager__tab__item__icon.fas.fa-surprise' );
		await page.click( 'button:has-text("Insert")' );

		icon = await editor.getPreviewFrame().waitForSelector( 'i.fa-surprise' );
		await editor.setSelectControlValue( 'view', 'stacked' );
		await editor.setSelectControlValue( 'shape', 'square' );

		// Style
		const width = '90';
		await editor.setWidgetTab( 'style' );
		await editor.setSliderControlValue( 'size', width );

		await expect.poll( async () => {
			icon = await editor.getPreviewFrame().waitForSelector( '.elementor-icon:first-child' );
			style = await getComputedStyle( icon, '' );
			return style.fontSize;
		} ).toBe( `${ width }px` );
	} );

	test( 'Icon widget wrapping HTML tag', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const testUrl = 'https://elementor.com/';
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = new EditorPage( page, testInfo );

		// Act.
		await wpAdmin.openNewPage();
		await editor.addWidget( { widgetType: 'icon' } );

		// Assert 1 - Default behavior (no link)
		await test.step( 'No link - DIV tag in Editor', async () => {
			const iconElement = editor.getPreviewFrame().locator( '.elementor-icon' );
			await expect( iconElement ).not.toHaveAttribute( 'href' );
			const tagName = await iconElement.evaluate( ( el ) => el.tagName );
			expect( tagName ).toBe( 'DIV' );
		} );

		// Act 2 - Add link
		await editor.setTextControlValue( 'link', testUrl );
		await editor.getPreviewFrame().locator( '.elementor-icon[href]' ).waitFor();

		// Assert 2 - With link the tag becomes anchor tag
		await test.step( 'Link anchor tag in the Editor', async () => {
			const iconElement = editor.getPreviewFrame().locator( '.elementor-icon' );
			await expect( iconElement ).toHaveAttribute( 'href', testUrl );
			const tagName = await iconElement.evaluate( ( el ) => el.tagName );
			expect( tagName ).toBe( 'A' );
		} );

		await test.step( 'Link anchor tag in the published page', async () => {
			await editor.publishAndViewPage();
			const iconElement = page.locator( '.elementor-icon' );
			await expect( iconElement ).toHaveAttribute( 'href', testUrl );
			const tagName = await iconElement.evaluate( ( el ) => el.tagName );
			expect( tagName ).toBe( 'A' );
		} );
	} );
} );
