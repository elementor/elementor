import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';
import EditorSelectors from '../selectors/editor-selectors';
import ButtonWidget from '../pages/widgets/button_widget';
import _path from 'path';

const defaultBtnName = 'Click here';

test( 'Button widget sanity test', async ( { page, apiRequests }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
		editor = await wpAdmin.openNewPage();

	// Act.
	await editor.addWidget( 'button' );

	const button = await editor.getPreviewFrame().waitForSelector( EditorSelectors.button.getByName( defaultBtnName ) );

	// Assert.
	expect( await button.innerText() ).toBe( 'Click here' );
} );

test( 'Button controls should return to default', async ( { page, apiRequests }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
		editor = await wpAdmin.openNewPage();

	await editor.addWidget( 'button' );
	await editor.openPanelTab( 'style' );

	await editor.getPreviewFrame().waitForSelector( EditorSelectors.button.getByName( defaultBtnName ) );

	const widget = editor.getPreviewFrame().locator( EditorSelectors.widget ),
		controlSelector = 'div.elementor-control-responsive-desktop:has-text("Position") label[data-tooltip="Center"]',
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

test( 'Verify button Id control', async ( { page, apiRequests }, testInfo ) => {
	const buttonId = 'mySuperId';
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	const buttonWidget = new ButtonWidget( page, testInfo );
	const editor = await wpAdmin.openNewPage();
	await buttonWidget.addWidget( defaultBtnName );
	await buttonWidget.setButtonId( buttonId, defaultBtnName );
	await editor.publishAndViewPage();
	expect( await buttonWidget.getButtonId( defaultBtnName ) ).toBe( buttonId );
} );

test( 'Verify Button with Icon styling', async ( { page, apiRequests }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	const editor = await wpAdmin.openNewPage();

	const filePath = _path.resolve( __dirname, `./templates/button-icon-styling.json` );
	await editor.loadTemplate( filePath, false );
	await editor.getPreviewFrame().locator( '.elementor-widget-button' ).first().waitFor();
	await editor.closeNavigatorIfOpen();

	// Assert
	await expect.soft( editor.getPreviewFrame().locator( '.e-con' ) ).toHaveScreenshot( 'button-container.png' );

	const buttonFirst = editor.getPreviewFrame().locator( '.elementor-widget-button a' ).first();
	await buttonFirst.hover();

	await expect.soft( buttonFirst ).toHaveScreenshot( 'button-hover-first.png' );

	const buttonLast = editor.getPreviewFrame().locator( '.elementor-widget-button a' ).last();
	await buttonLast.hover();

	await expect.soft( buttonLast ).toHaveScreenshot( 'button-hover-last.png' );
} );
