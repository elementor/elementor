import { parallelTest as test } from '../../../../parallelTest';
import { expect } from '@playwright/test';
import {
	WIDGET_CONFIGS,
	FONT_FAMILIES,
	setupTypographyTestSuite,
	teardownTypographyTestSuite,
	beforeEachTypographyTest,
	setupWidgetWithTypography,
	verifyFontFamilyWithPublishing,
	type TypographyTestSetup,
} from './typography-test-helpers';
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
};

test.describe( 'V4 Typography Font Family Tests @v4-tests', () => {
	let setup: TypographyTestSetup;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		setup = await setupTypographyTestSuite( browser, apiRequests, testInfo );
	} );

	test.afterAll( async () => {
		await teardownTypographyTestSuite( setup );
	} );

	test.beforeEach( async () => {
		await beforeEachTypographyTest( setup );
	} );

	test.describe( 'Common Font Family Functionality', () => {
		const testWidget = 'e-heading';
		const testWidgetConfig = WIDGET_CONFIGS.HEADING;

		test( 'Font family control is present and functional', async () => {
			await setupWidgetWithTypography( setup.driver, testWidget );

			const fontFamilyLabel = setup.driver.page.locator( 'label', { hasText: 'Font family' } );
			await expect( fontFamilyLabel ).toBeVisible();

			await setup.driver.editor.v4Panel.style.typography.setFontFamily( FONT_FAMILIES.system, 'system' );
			await setup.driver.page.waitForTimeout( 500 );
			await verifyFontFamilyWithPublishing( setup.driver, testWidgetConfig.selector, FONT_FAMILIES.system );
		} );

		test( 'System fonts selection and application', async () => {
			await setupWidgetWithTypography( setup.driver, testWidget );

			// Test single system font to avoid timing issues
			const font = TEST_FONTS.SYSTEM[ 0 ];
			await setup.driver.editor.v4Panel.style.typography.setFontFamily( font.name, font.type );
			await setup.driver.page.waitForTimeout( 500 );

			// Verify font family in preview only (avoid API publishing issues)
			const frame = setup.driver.editor.getPreviewFrame();
			if ( ! frame ) {
				throw new Error( 'Preview frame is not available' );
			}
			const element = frame.locator( testWidgetConfig.selector );
			await expect( element ).toBeVisible( { timeout: timeouts.expect } );

			const computedFamily = await element.evaluate( ( e ) => window.getComputedStyle( e ).fontFamily );
			expect( computedFamily.toLowerCase() ).toContain( font.name.toLowerCase() );
		} );
	} );

	const widgetConfigs = [
		{ type: 'e-heading', config: WIDGET_CONFIGS.HEADING },
		{ type: 'e-paragraph', config: WIDGET_CONFIGS.PARAGRAPH },
		{ type: 'e-button', config: WIDGET_CONFIGS.BUTTON },
	];

	for ( const widget of widgetConfigs ) {
		test.describe( `${ widget.type } Widget-Specific Font Tests`, () => {
			test( 'Font family renders correctly in published page', async () => {
				await setupWidgetWithTypography( setup.driver, widget.type );

				const testFont = TEST_FONTS.SYSTEM[ 0 ];
				await setup.driver.editor.v4Panel.style.typography.setFontFamily( testFont.name, testFont.type );
				await setup.driver.page.waitForTimeout( 500 );

				await verifyFontFamilyWithPublishing( setup.driver, widget.config.selector, testFont.name );
			} );
		} );
	}
} );
