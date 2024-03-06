import { test, expect } from '@playwright/test';
import WpAdminPage from '../pages/wp-admin-page';
import EditorSelectors from '../selectors/editor-selectors';
import ButtonWidget from '../pages/widgets/button_widget';

const defaultBtnName = 'Click here';

test( 'Button widget sanity test', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost();

	// Act.
	await editor.addWidget( 'button' );

	const button = await editor.getPreviewFrame().waitForSelector( EditorSelectors.button.getByName( defaultBtnName ) );

	// Assert.
	expect( await button.innerText() ).toBe( 'Click here' );
} );

test( 'Button controls should return to default', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost();

	await editor.addWidget( 'button' );
	await editor.activatePanelTab( 'style' );

	await editor.getPreviewFrame().waitForSelector( EditorSelectors.button.getByName( defaultBtnName ) );

	const widget = editor.getPreviewFrame().locator( EditorSelectors.widget ),
		controlSelector = 'div.elementor-control-responsive-desktop:has-text("Alignment") label[data-tooltip="Center"]',
		alignCenterClassRegex = /elementor-align-center/;

	// Act
	await editor.page.click( controlSelector );

	// Assert
	await expect( widget ).toHaveClass( alignCenterClassRegex );

	// Act
	await editor.page.click( controlSelector );

	// Assert
	await expect( widget ).not.toHaveClass( alignCenterClassRegex );
} );

test( 'Verify button Id control', async ( { page }, testInfo ) => {
	const buttonId = 'mySuperId';
	const wpAdmin = new WpAdminPage( page, testInfo );
	const buttonWidget = new ButtonWidget( page, testInfo );
	const editor = await wpAdmin.openNewPage();
	await buttonWidget.addWidget( defaultBtnName );
	await buttonWidget.setButtonId( buttonId, defaultBtnName );
	await editor.publishAndViewPage();
	expect( await buttonWidget.getButtonId( defaultBtnName ) ).toBe( buttonId );
} );

test( 'Verify Button Promotions', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo );
	await wpAdmin.openNewPage();
	const buttonWidget = new ButtonWidget( page, testInfo );
	await buttonWidget.addWidget( defaultBtnName );
	const promoArea = page.locator( '.elementor-nerd-box--upsale' );

	// Act.
	await promoArea.scrollIntoViewIfNeeded();

	// Assert
	expect.soft( await promoArea.screenshot( {
		type: 'png',
	} ) ).toMatchSnapshot( 'button-widget-sidebar-promotion.png' );
} );
