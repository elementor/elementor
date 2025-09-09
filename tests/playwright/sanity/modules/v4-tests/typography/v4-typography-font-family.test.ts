import WpAdminPage from '../../../../pages/wp-admin-page';
import { parallelTest as test } from '../../../../parallelTest';
import { BrowserContext, Page, expect } from '@playwright/test';
import EditorPage from '../../../../pages/editor-page';

const TEST_FONTS = {
	SYSTEM: [
		{ name: 'Arial', type: 'system' as const },
		{ name: 'Times New Roman', type: 'system' as const },
	],
	GOOGLE: [
		{ name: 'Open Sans', type: 'google' as const },
		{ name: 'Roboto', type: 'google' as const },
	],
};

const WIDGET_CONFIGS = [
	{ type: 'e-heading', selector: '.e-heading-base' },
	{ type: 'e-paragraph', selector: '.e-paragraph-base' },
	{ type: 'e-button', selector: '.e-button-base' },
];

test.describe( 'V4 Typography Font Family Tests @v4-tests', () => {
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

	async function verifyFontApplied( selector: string, expectedFontFamily: string ) {
		const frame = editor.getPreviewFrame();
		const element = frame.locator( selector );
		await expect( element ).toBeVisible();

		const computedFont = await element.evaluate( ( el ) => {
			return window.getComputedStyle( el ).fontFamily;
		} );

		expect( computedFont.toLowerCase() ).toContain( expectedFontFamily.toLowerCase() );
	}

	test.describe( 'Common Font Family Functionality', () => {
		const testWidget = 'e-heading';
		const testWidgetConfig = WIDGET_CONFIGS.find( ( w ) => w.type === testWidget );

		test( 'Font family control is present and functional', async () => {
			await setupWidgetWithTypography( testWidget );

			const fontFamilyLabel = page.locator( 'label', { hasText: 'Font family' } );
			await expect( fontFamilyLabel ).toBeVisible();

			await editor.v4Panel.setFontFamily( 'Arial', 'system' );
			await page.waitForTimeout( 500 );
			await verifyFontApplied( testWidgetConfig.selector, 'Arial' );
		} );

		test( 'System fonts selection and application', async () => {
			await setupWidgetWithTypography( testWidget );

			for ( const font of TEST_FONTS.SYSTEM ) {
				await editor.v4Panel.setFontFamily( font.name, font.type );
				await page.waitForTimeout( 500 );
				await verifyFontApplied( testWidgetConfig.selector, font.name );
			}
		} );

		test( 'Font switching and persistence', async () => {
			await setupWidgetWithTypography( testWidget );

			const systemFont = TEST_FONTS.SYSTEM[ 0 ];
			await editor.v4Panel.setFontFamily( systemFont.name, systemFont.type );
			await page.waitForTimeout( 500 );
			await verifyFontApplied( testWidgetConfig.selector, systemFont.name );

			const alternativeFont = TEST_FONTS.SYSTEM[ 1 ];
			await editor.v4Panel.setFontFamily( alternativeFont.name, alternativeFont.type );
			await page.waitForTimeout( 500 );
			await verifyFontApplied( testWidgetConfig.selector, alternativeFont.name );
		} );
	} );

	for ( const widget of WIDGET_CONFIGS ) {
		test.describe( `${ widget.type } Widget-Specific Font Tests`, () => {
			test( 'Font family renders correctly in published page', async () => {
				await setupWidgetWithTypography( widget.type );

				const testFont = TEST_FONTS.SYSTEM[ 0 ];
				await editor.v4Panel.setFontFamily( testFont.name, testFont.type );
				await page.waitForTimeout( 500 );

				await verifyFontApplied( widget.selector, testFont.name );
				await editor.publishAndViewPage();

				const publishedElement = page.locator( widget.selector );
				await expect( publishedElement ).toBeVisible();

				const publishedFont = await publishedElement.evaluate( ( el ) => {
					return window.getComputedStyle( el ).fontFamily;
				} );
				expect( publishedFont.toLowerCase() ).toContain( testFont.name.toLowerCase() );
			} );
		} );
	}
} );
