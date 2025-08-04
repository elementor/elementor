import WpAdminPage from '../../../pages/wp-admin-page';
import { parallelTest as test } from '../../../parallelTest';
import { BrowserContext, Page, expect } from '@playwright/test';
import EditorPage from '../../../pages/editor-page';

test.describe( 'V4 Typography Font Size Tests @v4-tests', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;
	let page: Page;
	const experimentName = 'e_atomic_elements';

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { [ experimentName ]: 'active' } );
	} );

	test.afterAll( async () => {
		await wpAdmin.resetExperiments();
		await context.close();
	} );

	test.beforeEach( async () => {
		editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
	} );

	// Helper function to setup widget and open typography section
	async function setupWidgetWithTypography( widgetType: string ) {
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		await editor.addWidget( { widgetType, container: containerId } );

		await editor.openV2PanelTab( 'style' );
		await editor.openV2Section( 'typography' );
		await editor.v4Panel.waitForTypographyControls();
	}

	// Helper function to setup button widget with text
	async function setupButtonWithText( text: string = 'Click me' ) {
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const widgetId = await editor.addWidget( { widgetType: 'e-button', container: containerId } );

		// Wait for content tab and set button text
		await editor.openV2PanelTab( 'general' );
		await page.waitForSelector( '#tabpanel-0-settings' );
		await editor.v4Panel.fillField( 0, text );

		// Switch to style tab and open typography section
		await editor.openV2PanelTab( 'style' );
		await editor.openV2Section( 'typography' );
		await editor.v4Panel.waitForTypographyControls();

		return { containerId, widgetId };
	}

	test.describe( 'Heading Font Size Input Functionality', () => {
		test( 'Numeric input accepts valid font sizes', async () => {
			await setupWidgetWithTypography( 'e-heading' );

			// Test regular number
			await editor.v4Panel.setTypography( { fontSize: '24' } );
			let typographyValues = await editor.v4Panel.getTypographyValues();
			expect( typographyValues.fontSize ).toBe( '24' );

			// Test decimal number
			await editor.v4Panel.setTypography( { fontSize: '24.5' } );
			typographyValues = await editor.v4Panel.getTypographyValues();
			expect( typographyValues.fontSize ).toBe( '24.5' );

			// Verify in preview
			const headingElement = editor.getPreviewFrame().locator( 'h2' );
			await expect( headingElement ).toHaveCSS( 'font-size', '24.5px' );
		} );

		test( 'Font size unit switching', async () => {
			await setupWidgetWithTypography( 'e-heading' );

			// Test different font size values
			const testCases = [
				{ value: '24', expected: '24px' },
				{ value: '1.5', expected: '1.5px' },
				{ value: '2', expected: '2px' },
				{ value: '5', expected: '5px' },
			];

			for ( const { value, expected } of testCases ) {
				// Set font size
				await editor.v4Panel.setTypography( { fontSize: value } );

				// Verify in preview
				const headingElement = editor.getPreviewFrame().locator( 'h2' );
				await expect( headingElement ).toHaveCSS( 'font-size', expected );
			}
		} );

		test( 'Responsive font size behavior', async () => {
			await setupWidgetWithTypography( 'e-heading' );

			// Set desktop font size
			await editor.v4Panel.setTypography( { fontSize: '24' } );

			// Switch to tablet view
			await editor.changeResponsiveView( 'tablet' );

			// Set tablet font size
			await editor.v4Panel.setTypography( { fontSize: '18' } );

			// Verify tablet size
			let typographyValues = await editor.v4Panel.getTypographyValues();
			expect( typographyValues.fontSize ).toBe( '18' );

			// Switch back to desktop and verify
			await editor.changeResponsiveView( 'desktop' );
			typographyValues = await editor.v4Panel.getTypographyValues();
			expect( typographyValues.fontSize ).toBe( '24' );
		} );

		test( 'Font size boundary values', async () => {
			await setupWidgetWithTypography( 'e-heading' );

			// Test minimum value
			await editor.v4Panel.setTypography( { fontSize: '1' } );
			let typographyValues = await editor.v4Panel.getTypographyValues();
			expect( typographyValues.fontSize ).toBe( '1' );

			// Test maximum value
			await editor.v4Panel.setTypography( { fontSize: '999' } );
			typographyValues = await editor.v4Panel.getTypographyValues();
			expect( typographyValues.fontSize ).toBe( '999' );
		} );

		test( 'Font size inheritance in responsive modes', async () => {
			await setupWidgetWithTypography( 'e-heading' );

			// Set desktop font size
			await editor.v4Panel.setTypography( { fontSize: '24' } );

			// Switch to tablet and wait for controls to be ready
			await editor.changeResponsiveView( 'tablet' );
			await editor.v4Panel.waitForTypographyControls();

			// Wait for the font size value to be inherited
			await page.waitForTimeout( 1000 );

			// Verify the heading element in preview
			const headingElement = editor.getPreviewFrame().locator( 'h2' );
			await expect( headingElement ).toHaveCSS( 'font-size', '24px' );
		} );
	} );

	test.describe( 'Paragraph Font Size Input Functionality', () => {
		test( 'Numeric input accepts valid font sizes', async () => {
			await setupWidgetWithTypography( 'e-paragraph' );

			// Test regular number
			await editor.v4Panel.setTypography( { fontSize: '18' } );
			let typographyValues = await editor.v4Panel.getTypographyValues();
			expect( typographyValues.fontSize ).toBe( '18' );

			// Test decimal number
			await editor.v4Panel.setTypography( { fontSize: '18.5' } );
			typographyValues = await editor.v4Panel.getTypographyValues();
			expect( typographyValues.fontSize ).toBe( '18.5' );

			// Verify in preview
			const paragraphElement = editor.getPreviewFrame().locator( '.e-paragraph-base' );
			await expect( paragraphElement ).toHaveCSS( 'font-size', '18.5px' );
		} );

		test( 'Font size unit switching', async () => {
			await setupWidgetWithTypography( 'e-paragraph' );

			// Test different font size values
			const testCases = [
				{ value: '18', expected: '18px' },
				{ value: '1.2', expected: '1.2px' },
				{ value: '16', expected: '16px' },
				{ value: '4', expected: '4px' },
			];

			for ( const { value, expected } of testCases ) {
				// Set font size
				await editor.v4Panel.setTypography( { fontSize: value } );

				// Verify in preview
				const paragraphElement = editor.getPreviewFrame().locator( '.e-paragraph-base' );
				await expect( paragraphElement ).toHaveCSS( 'font-size', expected );
			}
		} );

		test( 'Responsive font size behavior', async () => {
			await setupWidgetWithTypography( 'e-paragraph' );

			// Set desktop font size
			await editor.v4Panel.setTypography( { fontSize: '18' } );

			// Switch to tablet view
			await editor.changeResponsiveView( 'tablet' );

			// Set tablet font size
			await editor.v4Panel.setTypography( { fontSize: '16' } );

			// Verify tablet size
			let typographyValues = await editor.v4Panel.getTypographyValues();
			expect( typographyValues.fontSize ).toBe( '16' );

			// Switch back to desktop and verify
			await editor.changeResponsiveView( 'desktop' );
			typographyValues = await editor.v4Panel.getTypographyValues();
			expect( typographyValues.fontSize ).toBe( '18' );
		} );

		test( 'Font size inheritance in responsive modes', async () => {
			await setupWidgetWithTypography( 'e-paragraph' );

			// Set desktop font size
			await editor.v4Panel.setTypography( { fontSize: '18' } );

			// Switch to tablet and wait for controls to be ready
			await editor.changeResponsiveView( 'tablet' );
			await editor.v4Panel.waitForTypographyControls();

			// Wait for the font size value to be inherited
			await page.waitForTimeout( 1000 );

			// Verify the paragraph element in preview
			const paragraphElement = editor.getPreviewFrame().locator( '.e-paragraph-base' );
			await expect( paragraphElement ).toHaveCSS( 'font-size', '18px' );
		} );
	} );

	test.describe( 'Button Font Size Input Functionality', () => {
		test( 'Numeric input accepts valid font sizes', async () => {
			await setupButtonWithText();

			// Wait for the button to be fully initialized
			const frame = editor.getPreviewFrame();
			await frame.waitForSelector( '.e-button-base', { state: 'visible', timeout: 5000 } );

			// Test regular number
			await editor.v4Panel.setTypography( { fontSize: '16' } );
			let typographyValues = await editor.v4Panel.getTypographyValues();
			expect( typographyValues.fontSize ).toBe( '16' );

			// Test decimal number
			await editor.v4Panel.setTypography( { fontSize: '16.5' } );
			typographyValues = await editor.v4Panel.getTypographyValues();
			expect( typographyValues.fontSize ).toBe( '16.5' );

			// Verify in preview
			const buttonElement = frame.locator( '.e-button-base' );
			await expect( buttonElement ).toBeVisible();
			await expect( buttonElement ).toHaveCSS( 'font-size', '16.5px' );
		} );

		test( 'Font size unit switching', async () => {
			await setupButtonWithText();

			// Wait for the button to be fully initialized
			const frame = editor.getPreviewFrame();
			await frame.waitForSelector( '.e-button-base', { state: 'visible', timeout: 5000 } );

			// Test different font size values
			const testCases = [
				{ value: '16', expected: '16px' },
				{ value: '1.2', expected: '1.2px' },
				{ value: '14', expected: '14px' },
				{ value: '3', expected: '3px' },
			];

			for ( const { value, expected } of testCases ) {
				// Set font size
				await editor.v4Panel.setTypography( { fontSize: value } );

				// Verify in preview
				const buttonElement = frame.locator( '.e-button-base' );
				await expect( buttonElement ).toHaveCSS( 'font-size', expected );
			}
		} );

		test( 'Responsive font size behavior', async () => {
			await setupButtonWithText();

			// Wait for the button to be fully initialized
			const frame = editor.getPreviewFrame();
			await frame.waitForSelector( '.e-button-base', { state: 'visible', timeout: 5000 } );

			// Set desktop font size
			await editor.v4Panel.setTypography( { fontSize: '16' } );

			// Switch to tablet view
			await editor.changeResponsiveView( 'tablet' );

			// Set tablet font size
			await editor.v4Panel.setTypography( { fontSize: '14' } );

			// Verify tablet size
			let typographyValues = await editor.v4Panel.getTypographyValues();
			expect( typographyValues.fontSize ).toBe( '14' );

			// Switch back to desktop and verify
			await editor.changeResponsiveView( 'desktop' );
			typographyValues = await editor.v4Panel.getTypographyValues();
			expect( typographyValues.fontSize ).toBe( '16' );
		} );

		test( 'Font size inheritance in responsive modes', async () => {
			await setupButtonWithText();

			// Wait for the button to be fully initialized
			const frame = editor.getPreviewFrame();
			await frame.waitForSelector( '.e-button-base', { state: 'visible', timeout: 5000 } );

			// Set desktop font size
			await editor.v4Panel.setTypography( { fontSize: '16' } );

			// Switch to tablet and wait for controls to be ready
			await editor.changeResponsiveView( 'tablet' );
			await editor.v4Panel.waitForTypographyControls();

			// Wait for the font size value to be inherited
			await page.waitForTimeout( 1000 );

			// Verify the button element in preview
			const buttonElement = frame.locator( '.e-button-base' );
			await expect( buttonElement ).toHaveCSS( 'font-size', '16px' );
		} );
	} );
} );
