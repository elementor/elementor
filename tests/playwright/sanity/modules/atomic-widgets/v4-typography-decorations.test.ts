import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import { timeouts } from '../../../config/timeouts';
import { setupWidgetWithTypography } from '../v4-tests/typography/typography-test-helpers';
import { WIDGET_CONFIGS } from '../v4-tests/typography/typography-constants';
import { DriverFactory } from '../../../drivers/driver-factory';
import type { EditorDriver } from '../../../drivers/editor-driver';

test.describe( 'Atomic Widgets Advanced Typography @atomic-widgets', () => {
	let driver: EditorDriver;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		driver = await DriverFactory.createEditorDriver( browser, testInfo, apiRequests );
		await driver.wpAdmin.setExperiments( { e_atomic_elements: 'active' } );
	} );

	test.afterAll( async () => {
		await driver.wpAdmin.resetExperiments();
	} );

	test.beforeEach( async () => {
		await driver.createNewPage( true );
	} );

	test( 'Line decoration functionality', async () => {
		const widget = WIDGET_CONFIGS.HEADING;
		await setupWidgetWithTypography( driver, widget.type );

		const underlineButton = driver.page.getByRole( 'button', { name: 'Underline' } );
		await underlineButton.click();

		const element = driver.editor.getPreviewFrame().locator( widget.selector );
		await expect( element ).toHaveCSS( 'text-decoration-line', 'underline', { timeout: timeouts.expect } );
	} );

	test( 'Text transform functionality', async () => {
		const widget = WIDGET_CONFIGS.PARAGRAPH;
		await setupWidgetWithTypography( driver, widget.type );

		const uppercaseButton = driver.page.getByRole( 'button', { name: 'Uppercase' } );
		await uppercaseButton.click();

		const element = driver.editor.getPreviewFrame().locator( widget.selector );
		await expect( element ).toHaveCSS( 'text-transform', 'uppercase', { timeout: timeouts.expect } );
	} );

	test( 'Direction control functionality', async () => {
		const widget = WIDGET_CONFIGS.BUTTON;
		await setupWidgetWithTypography( driver, widget.type );

		const rtlButton = driver.page.getByRole( 'button', { name: 'Right to left' } );
		await rtlButton.click();

		const element = driver.editor.getPreviewFrame().locator( widget.selector );
		await expect( element ).toHaveCSS( 'direction', 'rtl', { timeout: timeouts.expect } );
	} );

	test( 'Font style functionality', async () => {
		const widget = WIDGET_CONFIGS.HEADING;
		await setupWidgetWithTypography( driver, widget.type );

		const italicButton = driver.page.getByRole( 'button', { name: 'Italic' } );
		await italicButton.click();

		const element = driver.editor.getPreviewFrame().locator( widget.selector );
		await expect( element ).toHaveCSS( 'font-style', 'italic', { timeout: timeouts.expect } );
	} );

	test( 'Text stroke functionality', async () => {
		const widget = WIDGET_CONFIGS.PARAGRAPH;
		await setupWidgetWithTypography( driver, widget.type );

		const addButton = driver.page.getByRole( 'button', { name: 'Add', exact: true } );
		await addButton.click();

		const element = driver.editor.getPreviewFrame().locator( widget.selector );
		await expect( element ).toHaveCSS( '-webkit-text-stroke-width', '1px', { timeout: timeouts.expect } );
	} );

	test( 'Integration: Multiple typography features on single widget', async () => {
		const headingWidget = WIDGET_CONFIGS.HEADING;

		await test.step( 'Verify multiple typography features in editor', async () => {
			await setupWidgetWithTypography( driver, headingWidget.type );

			const underlineButton = driver.page.getByRole( 'button', { name: 'Underline' } );
			await underlineButton.click();

			const italicButton = driver.page.getByRole( 'button', { name: 'Italic' } );
			await italicButton.click();

			const uppercaseButton = driver.page.getByRole( 'button', { name: 'Uppercase' } );
			await uppercaseButton.click();

			const rtlButton = driver.page.getByRole( 'button', { name: 'Right to left' } );
			await rtlButton.click();

			const addStrokeButton = driver.page.getByRole( 'button', { name: 'Add', exact: true } );
			await addStrokeButton.click();

			const headingElement = driver.editor.getPreviewFrame().locator( headingWidget.selector );

			await expect( headingElement ).toHaveCSS( 'text-decoration-line', 'underline', { timeout: timeouts.expect } );
			await expect( headingElement ).toHaveCSS( 'font-style', 'italic', { timeout: timeouts.expect } );
			await expect( headingElement ).toHaveCSS( 'text-transform', 'uppercase', { timeout: timeouts.expect } );
			await expect( headingElement ).toHaveCSS( 'direction', 'rtl', { timeout: timeouts.expect } );
			await expect( headingElement ).toHaveCSS( '-webkit-text-stroke-width', '1px', { timeout: timeouts.expect } );

			await expect( underlineButton ).toHaveAttribute( 'aria-pressed', 'true' );
			await expect( italicButton ).toHaveAttribute( 'aria-pressed', 'true' );
			await expect( uppercaseButton ).toHaveAttribute( 'aria-pressed', 'true' );
			await expect( rtlButton ).toHaveAttribute( 'aria-pressed', 'true' );

			const removeStrokeButton = driver.page.getByRole( 'button', { name: 'Remove' } );
			await expect( removeStrokeButton ).toBeVisible();

			await underlineButton.click();
			await expect( headingElement ).toHaveCSS( 'text-decoration-line', 'none', { timeout: timeouts.expect } );
			await expect( underlineButton ).toHaveAttribute( 'aria-pressed', 'false' );

			await removeStrokeButton.click();
			await expect( headingElement ).toHaveCSS( '-webkit-text-stroke-width', '0px', { timeout: timeouts.expect } );

			await expect( headingElement ).toHaveCSS( 'font-style', 'italic', { timeout: timeouts.expect } );
			await expect( headingElement ).toHaveCSS( 'text-transform', 'uppercase', { timeout: timeouts.expect } );
			await expect( headingElement ).toHaveCSS( 'direction', 'rtl', { timeout: timeouts.expect } );
		} );

		await test.step( 'Verify typography features persist on published page', async () => {
			await driver.editor.publishAndViewPage();

			const publishedElement = driver.page.locator( headingWidget.selector );
			await expect( publishedElement ).toBeVisible( { timeout: timeouts.expect } );

			await expect( publishedElement ).toHaveCSS( 'font-style', 'italic', { timeout: timeouts.expect } );
			await expect( publishedElement ).toHaveCSS( 'text-transform', 'uppercase', { timeout: timeouts.expect } );
			await expect( publishedElement ).toHaveCSS( 'direction', 'rtl', { timeout: timeouts.expect } );
		} );
	} );
} );

