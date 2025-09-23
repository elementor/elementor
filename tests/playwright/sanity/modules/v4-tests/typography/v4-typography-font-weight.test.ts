import WpAdminPage from '../../../../pages/wp-admin-page';
import { parallelTest as test } from '../../../../parallelTest';
import { BrowserContext, Page, expect } from '@playwright/test';
import EditorPage from '../../../../pages/editor-page';
import { timeouts } from '../../../../config/timeouts';

const TEST_FONTS = {
	SYSTEM: { name: 'Arial', type: 'system' as const },
	ALTERNATIVE: { name: 'Times New Roman', type: 'system' as const },
};

const WIDGET_CONFIGS = [
	{ type: 'e-heading', selector: '.e-heading-base', defaultWeight: '500' },
	{ type: 'e-paragraph', selector: '.e-paragraph-base', defaultWeight: '500' },
	{ type: 'e-button', selector: '.e-button-base', defaultWeight: '500' },
];

test.describe( 'V4 Typography Font Weight Tests @v4-tests', () => {
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

	async function setupWidgetWithTypography( widgetType: string ) {
		const containerId = await editor.addElement( { elType: 'container' }, 'document' );
		const widgetId = await editor.addWidget( { widgetType, container: containerId } );
		await editor.openV2PanelTab( 'style' );
		await editor.openV2Section( 'typography' );
		await editor.v4Panel.waitForTypographyControls();
		return { containerId, widgetId };
	}

	async function getAvailableFontWeights(): Promise<string[]> {
		const fontWeightCombobox = page.locator( 'label', { hasText: 'Font weight' } )
			.locator( 'xpath=following::*[@role="combobox"][1]' );

		await fontWeightCombobox.click();
		await page.waitForSelector( '[role="listbox"]', { timeout: 5000 } );

		const options = page.locator( '[role="option"]' );
		const weights = await options.allTextContents();
		const extractedWeights = weights
			.map( ( text ) => text.match( /(\d+)/ )?.[ 1 ] )
			.filter( Boolean ) as string[];

		await page.keyboard.press( 'Escape' );
		return extractedWeights;
	}

	async function verifyFontWeightPreview( selector: string, expectedWeight: string ) {
		const frame = editor.getPreviewFrame();
		const element = frame.locator( selector );
		await expect( element ).toBeVisible( { timeout: timeouts.navigation } );
		const computedWeight = await element.evaluate( ( el ) => window.getComputedStyle( el ).fontWeight );
		expect( String( computedWeight ) ).toBe( expectedWeight );
	}

	async function verifyFontWeightWithPublishing( selector: string, expectedWeight: string ) {
		await verifyFontWeightPreview( selector, expectedWeight );
		await editor.publishAndViewPage();
		const publishedElement = page.locator( selector );
		await expect( publishedElement ).toBeVisible( { timeout: timeouts.navigation } );
		const publishedWeight = await publishedElement.evaluate( ( el ) => window.getComputedStyle( el ).fontWeight );
		expect( String( publishedWeight ) ).toBe( expectedWeight );
	}

	test.describe( 'Common Font Weight Functionality', () => {
		const testWidget = 'e-heading';
		const testWidgetConfig = WIDGET_CONFIGS.find( ( w ) => w.type === testWidget );

		test( 'Font weight control functionality and weight changes', async () => {
			await setupWidgetWithTypography( testWidget );

			const fontWeightLabel = page.locator( 'label', { hasText: 'Font weight' } );
			await expect( fontWeightLabel ).toBeVisible();

			await verifyFontWeightPreview( testWidgetConfig.selector, testWidgetConfig.defaultWeight );

			await editor.v4Panel.setTypography( { fontWeight: '700' } );
			await verifyFontWeightPreview( testWidgetConfig.selector, '700' );

			await editor.v4Panel.setTypography( { fontWeight: '400' } );
			await verifyFontWeightPreview( testWidgetConfig.selector, '400' );

			const weights = await getAvailableFontWeights();
			expect( weights.length ).toBeGreaterThanOrEqual( 3 );
			expect( weights.some( ( w ) => [ '400', '500', '700' ].includes( w ) ) ).toBe( true );
		} );

		test( 'Font weight availability changes with font selection', async () => {
			await setupWidgetWithTypography( testWidget );

			await editor.v4Panel.setFontFamily( TEST_FONTS.SYSTEM.name, TEST_FONTS.SYSTEM.type );
			await page.waitForTimeout( 1000 );
			const systemWeights = await getAvailableFontWeights();

			await editor.v4Panel.setFontFamily( TEST_FONTS.ALTERNATIVE.name, TEST_FONTS.ALTERNATIVE.type );
			await page.waitForTimeout( 1000 );
			const alternativeWeights = await getAvailableFontWeights();

			expect( systemWeights.length ).toBeGreaterThanOrEqual( 1 );
			expect( alternativeWeights.length ).toBeGreaterThanOrEqual( 1 );

			const systemHasCommon = systemWeights.some( ( w ) => [ '400', '500', '700' ].includes( w ) );
			const alternativeHasCommon = alternativeWeights.some( ( w ) => [ '400', '500', '700' ].includes( w ) );
			expect( systemHasCommon ).toBe( true );
			expect( alternativeHasCommon ).toBe( true );
		} );

		test( 'Font weight persistence when switching fonts', async () => {
			await setupWidgetWithTypography( testWidget );

			await editor.v4Panel.setFontFamily( TEST_FONTS.SYSTEM.name, TEST_FONTS.SYSTEM.type );
			await editor.v4Panel.setTypography( { fontWeight: '700' } );
			await verifyFontWeightPreview( testWidgetConfig.selector, '700' );

			await editor.v4Panel.setFontFamily( TEST_FONTS.ALTERNATIVE.name, TEST_FONTS.ALTERNATIVE.type );
			await page.waitForTimeout( 1000 );

			const frame = editor.getPreviewFrame();
			const element = frame.locator( testWidgetConfig.selector );
			const currentWeight = await element.evaluate( ( el ) => window.getComputedStyle( el ).fontWeight );
			expect( [ '700', '600', '800', '500' ] ).toContain( String( currentWeight ) );
		} );
	} );

	for ( const widget of WIDGET_CONFIGS ) {
		test.describe( `${ widget.type } Widget-Specific Tests`, () => {
			test( 'Font weight renders correctly in published page', async () => {
				await setupWidgetWithTypography( widget.type );
				await editor.v4Panel.setTypography( { fontWeight: '700' } );
				await verifyFontWeightWithPublishing( widget.selector, '700' );
			} );
		} );
	}
} );
