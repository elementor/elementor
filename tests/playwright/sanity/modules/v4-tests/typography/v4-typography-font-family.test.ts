import { parallelTest as test } from '../../../../parallelTest';
import { expect } from '@playwright/test';
import {
	setupWidgetWithTypography,
	verifyFontFamilyOnFrontend,
} from './typography-test-helpers';
import { WIDGET_CONFIGS, FONT_FAMILIES } from './typography-constants';
import { DriverFactory } from '../../../../drivers/driver-factory';
import type { EditorDriver } from '../../../../drivers/editor-driver';
import { timeouts } from '../../../../config/timeouts';

const TEST_FONTS = {
	SYSTEM: [
		{ name: FONT_FAMILIES.system, type: 'system' as const },
		{ name: FONT_FAMILIES.systemAlt, type: 'system' as const },
	],
	GOOGLE: [
		{ name: FONT_FAMILIES.google, type: 'google' as const },
		{ name: 'Open Sans', type: 'google' as const },
	],
} as const;

// Test configuration for different widgets
const WIDGET_TEST_CONFIGS = [
	{ type: 'e-heading', config: WIDGET_CONFIGS.HEADING },
	{ type: 'e-paragraph', config: WIDGET_CONFIGS.PARAGRAPH },
	{ type: 'e-button', config: WIDGET_CONFIGS.BUTTON },
] as const;

test.describe( 'V4 Typography Font Family Tests @v4-tests', () => {
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

	// Helper function to test font family functionality
	async function testFontFamilyFunctionality( widgetType: string, widgetConfig: typeof WIDGET_CONFIGS.HEADING, fontName: string, fontType: 'system' | 'google' ): Promise<void> {
		await setupWidgetWithTypography( driver, widgetType );

		// Verify font family control is present
		const fontFamilyLabel = driver.page.locator( 'label', { hasText: 'Font family' } );
		await expect( fontFamilyLabel ).toBeVisible( { timeout: timeouts.expect } );

		// Set font family
		await driver.editor.v4Panel.style.setFontFamily( fontName, fontType );

		// Wait for font to be applied (condition-based wait instead of fixed timeout)
		const frame = driver.editor.getPreviewFrame();
		if ( ! frame ) {
			throw new Error( 'Preview frame is not available' );
		}

		const element = frame.locator( widgetConfig.selector );
		await expect( element ).toBeVisible( { timeout: timeouts.expect } );

		// Verify font family is applied
		await expect( element ).toHaveCSS( 'font-family', new RegExp( fontName, 'i' ), { timeout: timeouts.expect } );
	}

	test.describe( 'Font Family Control Functionality', () => {
		test( 'Font family control is present and functional', async () => {
			await testFontFamilyFunctionality( 'e-heading', WIDGET_CONFIGS.HEADING, FONT_FAMILIES.system, 'system' );
		} );

		test( 'System fonts selection and application', async () => {
			const testFont = TEST_FONTS.SYSTEM[ 0 ];
			await testFontFamilyFunctionality( 'e-heading', WIDGET_CONFIGS.HEADING, testFont.name, testFont.type );
		} );
	} );

	test.describe( 'Widget-Specific Font Family Tests', () => {
		// Test font family functionality across different widget types
		for ( const widget of WIDGET_TEST_CONFIGS ) {
			test( `${ widget.type } - Font family renders correctly`, async () => {
				const testFont = TEST_FONTS.SYSTEM[ 0 ];
				await testFontFamilyFunctionality( widget.type, widget.config, testFont.name, testFont.type );
			} );
		}

		// Test multiple system fonts to ensure font switching works correctly
		test( 'Multiple system fonts work correctly', async () => {
			const testWidget = WIDGET_TEST_CONFIGS[ 0 ]; // Use first widget for efficiency
			
			// Test each system font individually to avoid UI state issues
			for ( const font of TEST_FONTS.SYSTEM ) {
				// Create a fresh page for each font test to avoid state conflicts
				await driver.createNewPage( true );
				await testFontFamilyFunctionality( testWidget.type, testWidget.config, font.name, font.type );
			}
		} );

		// Test Google fonts
		test( 'Google fonts work correctly', async () => {
			const testWidget = WIDGET_TEST_CONFIGS[ 0 ];
			const googleFont = TEST_FONTS.GOOGLE[ 0 ]; // Test first Google font (Open Sans)
			
			await testFontFamilyFunctionality( testWidget.type, testWidget.config, googleFont.name, googleFont.type );
		} );
	} );
} );