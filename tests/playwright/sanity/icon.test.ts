import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';

test( 'Icon widget sanity test', async ( { page, apiRequests }, testInfo ) => {
	const getComputedStyle = async ( element, pseudo: string ) => page.evaluate( ( [ e, p ] ) => getComputedStyle( e, p ), [ element, pseudo ] );

	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	const editor = await wpAdmin.openNewPage();
	const preview = editor.getPreviewFrame();

	await editor.addWidget( 'icon' );
	let icon = await preview.waitForSelector( 'i.fa-star' );
	let style = await getComputedStyle( icon, 'before' );
	expect( style.content.charCodeAt() ).toBe( 34 );

	await page.click( '.elementor-control-media__preview' );
	await page.click( '.elementor-icons-manager__tab__item__icon.fas.fa-surprise' );
	await page.click( 'button:has-text("Insert")' );

	icon = await preview.waitForSelector( 'i.fa-surprise' );
	await editor.setSelectControlValue( 'view', 'stacked' );
	await editor.setSelectControlValue( 'shape', 'square' );

	// Style
	const width = '90';
	await editor.setWidgetTab( 'style' );
	await editor.setSliderControlValue( 'size', width );

	await expect.poll( async () => {
		icon = await preview.waitForSelector( '.elementor-icon:first-child' );
		style = await getComputedStyle( icon, '' );
		return style.fontSize;
	} ).toBe( `${ width }px` );
} );
