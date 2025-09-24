import { parallelTest as test } from '../../../../parallelTest';
import { expect } from '@playwright/test';
import {
	WIDGET_CONFIGS,
	FONT_FAMILIES,
	setupTypographyTestSuite,
	teardownTypographyTestSuite,
	beforeEachTypographyTest,
	setupWidgetWithTypography,
	type TypographyTestSetup,
} from './typography-test-helpers';
import { timeouts } from '../../../../config/timeouts';

const TEST_FONTS = {
	SYSTEM: { name: FONT_FAMILIES.system, type: 'system' as const },
	ALTERNATIVE: { name: FONT_FAMILIES.systemAlt, type: 'system' as const },
};

test.describe( 'V4 Typography Font Weight Tests @v4-tests', () => {
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

	async function getAvailableFontWeights(): Promise<string[]> {
		const fontWeightCombobox = setup.driver.page.locator( 'label', { hasText: 'Font weight' } )
			.locator( 'xpath=following::*[@role="combobox"][1]' );

		await fontWeightCombobox.click();
		await setup.driver.page.waitForSelector( '[role="listbox"]', { timeout: 5000 } );

		const options = setup.driver.page.locator( '[role="option"]' );
		const weights = await options.allTextContents();
		const extractedWeights = weights
			.map( ( text ) => text.match( /(\d+)/ )?.[ 1 ] )
			.filter( Boolean ) as string[];

		await setup.driver.page.keyboard.press( 'Escape' );
		return extractedWeights;
	}

	async function verifyFontWeightPreview( selector: string, expectedWeight: string ) {
		if ( ! setup.driver.editor ) {
			throw new Error( 'Editor is not initialized' );
		}
		const frame = setup.driver.editor.getPreviewFrame();
		if ( ! frame ) {
			throw new Error( 'Preview frame is not available' );
		}
		const element = frame.locator( selector );
		await expect( element ).toBeVisible( { timeout: timeouts.navigation } );
		const computedWeight = await element.evaluate( ( el ) => window.getComputedStyle( el ).fontWeight );
		expect( String( computedWeight ) ).toBe( expectedWeight );
	}

	async function verifyFontWeightWithPublishing( selector: string, expectedWeight: string ) {
		await verifyFontWeightPreview( selector, expectedWeight );
		await setup.driver.editor.publishAndViewPage();
		const publishedElement = setup.driver.page.locator( selector );
		await expect( publishedElement ).toBeVisible( { timeout: timeouts.navigation } );
		const publishedWeight = await publishedElement.evaluate( ( el ) => window.getComputedStyle( el ).fontWeight );
		expect( String( publishedWeight ) ).toBe( expectedWeight );
	}

	test.describe( 'Common Font Weight Functionality', () => {
		const testWidget = 'e-heading';
		const testWidgetConfig = WIDGET_CONFIGS.HEADING;

		test( 'Font weight control functionality and weight changes', async () => {
			await setupWidgetWithTypography( setup.driver, testWidget );

			const fontWeightLabel = setup.driver.page.locator( 'label', { hasText: 'Font weight' } );
			await expect( fontWeightLabel ).toBeVisible();

			await verifyFontWeightPreview( testWidgetConfig.selector, '500' );

			await setup.driver.editor.v4Panel.style.typography.setTypography( { fontWeight: '700' } );
			await verifyFontWeightPreview( testWidgetConfig.selector, '700' );

			await setup.driver.editor.v4Panel.style.typography.setTypography( { fontWeight: '400' } );
			await verifyFontWeightPreview( testWidgetConfig.selector, '400' );

			const weights = await getAvailableFontWeights();
			expect( weights.length ).toBeGreaterThanOrEqual( 3 );
			expect( weights.some( ( w ) => [ '400', '500', '700' ].includes( w ) ) ).toBe( true );
		} );

		test( 'Font weight availability changes with font selection', async () => {
			await setupWidgetWithTypography( setup.driver, testWidget );

			await setup.driver.editor.v4Panel.style.typography.setFontFamily( TEST_FONTS.SYSTEM.name, TEST_FONTS.SYSTEM.type );
			await setup.driver.page.waitForTimeout( 1000 );
			const systemWeights = await getAvailableFontWeights();

			await setup.driver.editor.v4Panel.style.typography.setFontFamily( TEST_FONTS.ALTERNATIVE.name, TEST_FONTS.ALTERNATIVE.type );
			await setup.driver.page.waitForTimeout( 1000 );
			const alternativeWeights = await getAvailableFontWeights();

			expect( systemWeights.length ).toBeGreaterThanOrEqual( 1 );
			expect( alternativeWeights.length ).toBeGreaterThanOrEqual( 1 );

			const systemHasCommon = systemWeights.some( ( w ) => [ '400', '500', '700' ].includes( w ) );
			const alternativeHasCommon = alternativeWeights.some( ( w ) => [ '400', '500', '700' ].includes( w ) );
			expect( systemHasCommon ).toBe( true );
			expect( alternativeHasCommon ).toBe( true );
		} );

		test( 'Font weight persistence when switching fonts', async () => {
			await setupWidgetWithTypography( setup.driver, testWidget );

			await setup.driver.editor.v4Panel.style.typography.setFontFamily( TEST_FONTS.SYSTEM.name, TEST_FONTS.SYSTEM.type );
			await setup.driver.editor.v4Panel.style.typography.setTypography( { fontWeight: '700' } );
			await verifyFontWeightPreview( testWidgetConfig.selector, '700' );

			await setup.driver.editor.v4Panel.style.typography.setFontFamily( TEST_FONTS.ALTERNATIVE.name, TEST_FONTS.ALTERNATIVE.type );
			await setup.driver.page.waitForTimeout( 1000 );

			const frame = setup.driver.editor.getPreviewFrame();
			const element = frame.locator( testWidgetConfig.selector );
			const currentWeight = await element.evaluate( ( el ) => window.getComputedStyle( el ).fontWeight );
			expect( [ '700', '600', '800', '500' ] ).toContain( String( currentWeight ) );
		} );
	} );

	const widgetConfigs = [
		{ type: 'e-heading', config: WIDGET_CONFIGS.HEADING },
		{ type: 'e-paragraph', config: WIDGET_CONFIGS.PARAGRAPH },
		{ type: 'e-button', config: WIDGET_CONFIGS.BUTTON },
	];

	for ( const widget of widgetConfigs ) {
		test.describe( `${ widget.type } Widget-Specific Tests`, () => {
			test( 'Font weight renders correctly in published page', async () => {
				await setupWidgetWithTypography( setup.driver, widget.type );
				await setup.driver.editor.v4Panel.style.typography.setTypography( { fontWeight: '700' } );
				await verifyFontWeightWithPublishing( widget.config.selector, '700' );
			} );
		} );
	}
} );
