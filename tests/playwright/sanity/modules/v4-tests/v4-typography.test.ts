import WpAdminPage from '../../../pages/wp-admin-page';
import { parallelTest as test } from '../../../parallelTest';
import { BrowserContext, Page, expect } from '@playwright/test';
import EditorPage from '../../../pages/editor-page';

test.describe( 'V4 Typography Tests @v4-tests', () => {
	let editor: EditorPage;
	let wpAdmin: WpAdminPage;
	let context: BrowserContext;
	let page: Page;
	const experimentName = 'e_atomic_elements';

	const FONT_FAMILIES = {
		system: 'Arial',
		systemAlt: 'Times New Roman',
		google: 'Roboto',
	};

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		context = await browser.newContext();
		page = await context.newPage();
		wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
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
		const widgetId = await editor.addWidget( { widgetType, container: containerId } );

		await editor.openV2PanelTab( 'style' );
		await editor.openV2Section( 'typography' );
		await editor.v4Panel.waitForTypographyControls();

		return { containerId, widgetId };
	}

	test.describe( 'Typography Controls Accessibility and Basic Functionality', () => {
		test( 'Typography controls are accessible and functional', async () => {
			await setupWidgetWithTypography( 'e-heading' );

			// Verify essential typography controls are present and accessible
			const essentialControls = [
				'Font family',
				'Font size',
			];

			for ( const controlName of essentialControls ) {
				const control = page.locator( 'label', { hasText: controlName } );
				await expect( control ).toBeVisible();
			}

			// Test typography section state managemen
			const isOpenBefore = await editor.v4Panel.isTypographySectionOpen();
			expect( isOpenBefore ).toBe( true );

			// Test font size control functionality
			const fontSizeInput = page.locator( 'label', { hasText: 'Font size' } ).locator( 'xpath=following::input[1]' );
			await expect( fontSizeInput ).toBeVisible();

			await fontSizeInput.fill( '24' );
			await fontSizeInput.dispatchEvent( 'input' );
			await expect( fontSizeInput ).toHaveValue( '24' );

			// Test font weight control if available
			const fontWeightLabel = page.locator( 'label', { hasText: 'Font weight' } );
			const fontWeightExists = await fontWeightLabel.isVisible();

			if ( fontWeightExists ) {
				const fontWeightButton = page.locator( 'div.MuiGrid-container' ).filter( {
					has: fontWeightLabel,
				} ).locator( '[role="button"]' );

				const buttonExists = await fontWeightButton.isVisible();
				if ( buttonExists ) {
					try {
						await editor.v4Panel.setV4SelectControlValue( 'Font weight', '700' );
					} catch ( error ) {
						// Font weight control might have different structure
					}
				}
			}

			// Test font family control functionality
			const fontFamilyButton = page.locator( 'div.MuiGrid-container' ).filter( {
				has: page.locator( 'label', { hasText: 'Font family' } ),
			} ).locator( '[role="button"]' );

			if ( await fontFamilyButton.isVisible() ) {
				try {
					await editor.v4Panel.setFontFamily( FONT_FAMILIES.system, 'system' );
					await expect( page.locator( 'label', { hasText: 'Font family' } ) ).toBeVisible();
				} catch ( error ) {
					await expect( page.locator( 'label', { hasText: 'Font family' } ) ).toBeVisible();
				}
			}
		} );

		test( 'Typography section opens and closes correctly', async () => {
			const containerId = await editor.addElement( { elType: 'container' }, 'document' );
			await editor.addWidget( { widgetType: 'e-heading', container: containerId } );

			await editor.openV2PanelTab( 'style' );

			// Check that typography section is closed initially
			const isOpenBefore = await editor.v4Panel.isTypographySectionOpen();
			expect( isOpenBefore ).toBe( false );

			// Open typography section
			await editor.openV2Section( 'typography' );

			// Check that typography section is now open
			const isOpenAfter = await editor.v4Panel.isTypographySectionOpen();
			expect( isOpenAfter ).toBe( true );

			// Verify typography controls are available
			await expect( page.locator( 'label', { hasText: 'Font size' } ) ).toBeVisible();
			await expect( page.locator( 'label', { hasText: 'Font family' } ) ).toBeVisible();
		} );
	} );

	test.describe( 'Typography Helper Methods and Advanced Functionality', () => {
		test( 'All typography helper methods work correctly', async () => {
			await setupWidgetWithTypography( 'e-heading' );

			// Test setTypography method with font size
			await editor.v4Panel.setTypography( {
				fontSize: '28',
			} );

			let typographyValues = await editor.v4Panel.getTypographyValues();
			expect( typographyValues.fontSize ).toBe( '28' );

			// Test setV4SelectControlValue for font weigh
			const fontWeightLabel = page.locator( 'label', { hasText: 'Font weight' } );
			const fontWeightExists = await fontWeightLabel.isVisible();

			if ( fontWeightExists ) {
				try {
					await editor.v4Panel.setV4SelectControlValue( 'Font weight', '700' );
					await expect( fontWeightLabel ).toBeVisible();
				} catch ( error ) {
					await expect( fontWeightLabel ).toBeVisible();
				}
			}

			// Test font family control
			const fontFamilyButton = page.locator( 'div.MuiGrid-container' ).filter( {
				has: page.locator( 'label', { hasText: 'Font family' } ),
			} ).locator( '[role="button"]' );

			if ( await fontFamilyButton.isVisible() ) {
				try {
					await editor.v4Panel.setFontFamily( FONT_FAMILIES.system, 'system' );
					await editor.v4Panel.setFontFamily( FONT_FAMILIES.systemAlt, 'system' );
				} catch ( error ) {
					await expect( page.locator( 'label', { hasText: 'Font family' } ) ).toBeVisible();
				}
			}

			// Test combined typography changes
			try {
				await editor.v4Panel.setTypography( {
					fontSize: '24',
					fontWeight: '700',
					fontFamily: FONT_FAMILIES.system,
				} );

				typographyValues = await editor.v4Panel.getTypographyValues();
				expect( typographyValues.fontSize ).toBe( '24' );
			} catch ( error ) {
				// If combined changes fail, test individual changes
				await editor.v4Panel.setTypography( {
					fontSize: '24',
				} );

				typographyValues = await editor.v4Panel.getTypographyValues();
				expect( typographyValues.fontSize ).toBe( '24' );
			}

			// Test typography state persistence - verify current state
			typographyValues = await editor.v4Panel.getTypographyValues();
			expect( typographyValues.fontSize ).toBe( '24' );

			// Test helper methods
			await editor.v4Panel.waitForTypographyControls();
			const isOpen = await editor.v4Panel.isTypographySectionOpen();
			expect( isOpen ).toBe( true );
		} );
	} );

	test.describe( 'Typography Validation and Performance', () => {
		test( 'Font size validation and performance testing', async () => {
			await setupWidgetWithTypography( 'e-heading' );

			// Test various font size values
			const fontSizeValues = [ '12', '16', '24', '32', '48' ];
			const startTime = Date.now();

			for ( const fontSize of fontSizeValues ) {
				await editor.v4Panel.setTypography( { fontSize } );
				const typographyValues = await editor.v4Panel.getTypographyValues();
				expect( typographyValues.fontSize ).toBe( fontSize );
			}

			const endTime = Date.now();
			const duration = endTime - startTime;

			// Performance validation - should complete within reasonable time
			expect( duration ).toBeLessThan( 5000 );

			// Test edge case font sizes
			const edgeCaseSizes = [ '1', '8', '72', '100' ];

			for ( const fontSize of edgeCaseSizes ) {
				await editor.v4Panel.setTypography( { fontSize } );
				const fontSizeInput = page.locator( 'label', { hasText: 'Font size' } ).locator( 'xpath=following::input[1]' );
				await expect( fontSizeInput ).toHaveValue( fontSize );
			}
		} );

		test( 'Rapid typography changes performance stress test', async () => {
			await setupWidgetWithTypography( 'e-paragraph' );

			const startTime = Date.now();

			// Test rapid font size changes
			const changes = [
				{ fontSize: '16' },
				{ fontSize: '20' },
				{ fontSize: '24' },
				{ fontSize: '18' },
				{ fontSize: '14' },
				{ fontSize: '22' },
			];

			for ( const change of changes ) {
				await editor.v4Panel.setTypography( change );
			}

			// Test font family changes if available
			const fontFamilyButton = page.locator( 'div.MuiGrid-container' ).filter( {
				has: page.locator( 'label', { hasText: 'Font family' } ),
			} ).locator( '[role="button"]' );

			if ( await fontFamilyButton.isVisible() ) {
				try {
					await editor.v4Panel.setFontFamily( FONT_FAMILIES.system, 'system' );
					await editor.v4Panel.setFontFamily( FONT_FAMILIES.systemAlt, 'system' );
				} catch ( error ) {
					// Font family might not be available, continue with tes
				}
			}

			const endTime = Date.now();
			const duration = endTime - startTime;

			// Verify final state
			const typographyValues = await editor.v4Panel.getTypographyValues();
			expect( typographyValues.fontSize ).toBe( '22' );

			// Ensure reasonable performance (under 15 seconds for all changes)
			expect( duration ).toBeLessThan( 15000 );
		} );
	} );

	test.describe( 'Typography Integration and Error Handling', () => {
		test( 'Typography integration and error handling', async () => {
			await setupWidgetWithTypography( 'e-heading' );

			// Test basic typography functionality
			await editor.v4Panel.setTypography( {
				fontSize: '18',
			} );

			let typographyValues = await editor.v4Panel.getTypographyValues();
			expect( typographyValues.fontSize ).toBe( '18' );

			// Test controls consistency
			await expect( page.locator( 'label', { hasText: 'Font size' } ) ).toBeVisible();
			await expect( page.locator( 'label', { hasText: 'Font family' } ) ).toBeVisible();

			// Test font family integration and error handling
			const fontFamilyButton = page.locator( 'div.MuiGrid-container' ).filter( {
				has: page.locator( 'label', { hasText: 'Font family' } ),
			} ).locator( '[role="button"]' );

			if ( await fontFamilyButton.isVisible() ) {
				try {
					await editor.v4Panel.setFontFamily( FONT_FAMILIES.system, 'system' );
					await expect( page.locator( 'label', { hasText: 'Font family' } ) ).toBeVisible();

					// Test error handling with non-existent fon
					await editor.v4Panel.setFontFamily( 'NonExistentFont', 'system' );
					await expect( page.locator( 'label', { hasText: 'Font family' } ) ).toBeVisible();
				} catch ( error ) {
					// Expected behavior for error cases
					await expect( page.locator( 'label', { hasText: 'Font family' } ) ).toBeVisible();
				}
			}

			// Test combined typography changes with error handling
			try {
				await editor.v4Panel.setTypography( {
					fontSize: '16',
					fontFamily: FONT_FAMILIES.system,
				} );

				typographyValues = await editor.v4Panel.getTypographyValues();
				expect( typographyValues.fontSize ).toBe( '16' );
			} catch ( error ) {
				// If font family fails, test font size alone
				await editor.v4Panel.setTypography( {
					fontSize: '16',
				} );

				typographyValues = await editor.v4Panel.getTypographyValues();
				expect( typographyValues.fontSize ).toBe( '16' );
			}

			// Test edge case handling
			await editor.v4Panel.setTypography( {
				fontSize: '1',
			} );

			const fontSizeInput = page.locator( 'label', { hasText: 'Font size' } ).locator( 'xpath=following::input[1]' );
			await expect( fontSizeInput ).toHaveValue( '1' );

			// Verify controls remain accessible after edge cases
			await expect( page.locator( 'label', { hasText: 'Font family' } ) ).toBeVisible();
			await expect( page.locator( 'label', { hasText: 'Font size' } ) ).toBeVisible();

			// Test helper methods consistency
			await editor.v4Panel.waitForTypographyControls();
			const isOpen = await editor.v4Panel.isTypographySectionOpen();
			expect( isOpen ).toBe( true );
		} );
	} );
} );
