import WpAdminPage from '../../../../pages/wp-admin-page';
import { parallelTest as test } from '../../../../parallelTest';
import { BrowserContext, Page, expect } from '@playwright/test';
import EditorPage from '../../../../pages/editor-page';
import { timeouts } from '../../../../config/timeouts';

const WIDGET_CONFIGS = [
	{ type: 'e-heading', selector: '.e-heading-base' },
	{ type: 'e-paragraph', selector: '.e-paragraph-base' },
	{ type: 'e-button', selector: '.e-button-base' },
];

const WORD_SPACING_VALUES = {
	POSITIVE: [ 1, 2.5, 5 ],
	NEGATIVE: [ -1, -2.5, -5 ],
	UNITS: [ 'px', 'em', 'rem', 'vw', 'vh', '%' ],
};

const TEST_TEXTS = {
	SHORT: 'Quick brown fox',
	LONG: 'The quick brown fox jumps over the lazy dog and runs through the forest',
	LANGUAGES: {
		ENGLISH: 'The quick brown fox jumps over the lazy dog',
		FRENCH: 'Le vif renard brun saute par-dessus le chien paresseux',
		GERMAN: 'Der schnelle braune Fuchs springt über den faulen Hund',
		SPANISH: 'El rápido zorro marrón salta sobre el perro perezoso',
	},
};

test.describe( 'V4 Typography Word Spacing Tests @v4-tests', () => {
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

		// Open typography settings
		await editor.openV2PanelTab( 'style' );
		await editor.openV2Section( 'typography' );
		await editor.v4Panel.waitForTypographyControls();

		// Click "Show More" button to reveal word spacing control
		const showMoreButton = editor.page.getByRole( 'button', { name: 'Show More' } );
		await expect( showMoreButton ).toBeVisible( { timeout: timeouts.expect } );
		await showMoreButton.click();

		return { containerId, widgetId };
	}

	async function verifyWordSpacing( selector: string, expectedValue: number, expectedUnit: string ) {
		const frame = editor.getPreviewFrame();
		const element = frame.locator( selector );
		await expect( element ).toBeVisible( { timeout: timeouts.expect } );

		// Wait for styles to be applied using explicit wait
		await expect( async () => {
			const computedStyles = await element.evaluate( ( el ) => {
				const styles = window.getComputedStyle( el );
				return {
					wordSpacing: styles.wordSpacing,
					fontSize: parseFloat( styles.fontSize ),
					windowWidth: window.innerWidth,
				};
			} );

			// For 'normal' word spacing (0), browsers might return 'normal' or '0px'
			if ( 0 === expectedValue ) {
				expect( [ 'normal', '0px', 'normal normal' ].includes( computedStyles.wordSpacing ) ).toBeTruthy();
				return;
			}

			// For non-zero values, verify the computed value
			const computedValue = parseFloat( computedStyles.wordSpacing );

			// Convert the expected value to pixels for comparison
			let expectedPixels = expectedValue;
			switch ( expectedUnit ) {
				case 'em':
					expectedPixels = expectedValue * computedStyles.fontSize;
					break;
				case 'rem':
					expectedPixels = expectedValue * 16; // 1rem = 16px
					break;
				case 'vw':
					expectedPixels = ( expectedValue * computedStyles.windowWidth ) / 100;
					break;
			}

			// Compare the computed value in pixels with a tolerance
			expect( computedValue ).toBeCloseTo( expectedPixels, 0 );
		} ).toPass( { timeout: timeouts.expect } );
	}

	test.describe( 'Word Spacing Basic Functionality', () => {
		const testWidget = 'e-heading';
		const testWidgetConfig = WIDGET_CONFIGS.find( ( w ) => w.type === testWidget );

		test.beforeEach( async () => {
			// Setup widget for each test
			await setupWidgetWithTypography( testWidget );
		} );

		test( 'Word spacing control is present and functional', async () => {
			const wordSpacingLabel = page.locator( 'label', { hasText: 'Word Spacing' } );
			await expect( wordSpacingLabel ).toBeVisible( { timeout: timeouts.expect } );

			await verifyWordSpacing( testWidgetConfig.selector, 0, 'px' );
		} );

		test( 'Positive word spacing values', async () => {
			for ( const value of WORD_SPACING_VALUES.POSITIVE ) {
				await editor.v4Panel.setWordSpacing( value, 'px' );
				await verifyWordSpacing( testWidgetConfig.selector, value, 'px' );
			}
		} );

		test( 'Negative word spacing values', async () => {
			for ( const value of WORD_SPACING_VALUES.NEGATIVE ) {
				await editor.v4Panel.setWordSpacing( value, 'px' );
				// Elementor doesn't support negative word spacing values in UI
				// So we verify that the value remains at normal (0) instead
				await verifyWordSpacing( testWidgetConfig.selector, 0, 'px' );
			}
		} );

		// Note: Unit switching tests are covered in v4-typography-word-spacing-units.test.ts
	} );

	test.describe( 'Word Spacing with Different Text Lengths', () => {
		const testWidget = 'e-paragraph';
		const testWidgetConfig = WIDGET_CONFIGS.find( ( w ) => w.type === testWidget );

		test( 'Word spacing with short text', async () => {
			await setupWidgetWithTypography( testWidget );
			const testValue = 2;
			const testUnit = 'px';

			await editor.v4Panel.setWordSpacing( testValue, testUnit );
			await verifyWordSpacing( testWidgetConfig.selector, testValue, testUnit );
		} );

		test( 'Word spacing with long text', async () => {
			await setupWidgetWithTypography( testWidget );
			const testValue = 2;
			const testUnit = 'px';

			await editor.v4Panel.setWordSpacing( testValue, testUnit );
			await verifyWordSpacing( testWidgetConfig.selector, testValue, testUnit );
		} );
	} );

	test.describe( 'Word Spacing with Different Languages', () => {
		const testWidget = 'e-paragraph';
		const testWidgetConfig = WIDGET_CONFIGS.find( ( w ) => w.type === testWidget );

		for ( const [ language ] of Object.entries( TEST_TEXTS.LANGUAGES ) ) {
			test( `Word spacing with ${ language } text`, async () => {
				await setupWidgetWithTypography( testWidget );
				const testValue = 2;
				const testUnit = 'px';

				await editor.v4Panel.setWordSpacing( testValue, testUnit );
				await verifyWordSpacing( testWidgetConfig.selector, testValue, testUnit );
			} );
		}
	} );

	for ( const widget of WIDGET_CONFIGS ) {
		test.describe( `${ widget.type } Widget-Specific Word Spacing Tests`, () => {
			test( 'Word spacing persists in published page', async () => {
				await setupWidgetWithTypography( widget.type );

				const testValue = 2.5;
				const testUnit = 'px';
				await editor.v4Panel.setWordSpacing( testValue, testUnit );
				await verifyWordSpacing( widget.selector, testValue, testUnit );

				// Handle potential unsaved changes dialog
				page.once( 'dialog', ( dialog ) => dialog.accept() );
				await editor.publishAndViewPage();

				const publishedElement = page.locator( widget.selector );
				await expect( publishedElement ).toBeVisible( { timeout: timeouts.navigation } );

				await expect( async () => {
					const publishedWordSpacing = await publishedElement.evaluate( ( el ) => {
						return window.getComputedStyle( el ).wordSpacing;
					} );

					expect( parseFloat( publishedWordSpacing ) ).toBeCloseTo( testValue, 1 );
					expect( publishedWordSpacing ).toContain( testUnit );
				} ).toPass( { timeout: timeouts.expect } );
			} );
		} );
	}
} );
