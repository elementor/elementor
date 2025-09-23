import { BrowserContext, Page, expect } from '@playwright/test';
import EditorPage from '../../../../pages/editor-page';
import WpAdminPage from '../../../../pages/wp-admin-page';
import { timeouts } from '../../../../config/timeouts';

// Common constants
export const EXPERIMENT_NAME = 'e_atomic_elements';

// Common widget configurations
export const WIDGET_CONFIGS = {
	HEADING: {
		type: 'e-heading',
		selector: '.e-heading-base',
		defaultSize: '32px',
	},
	PARAGRAPH: {
		type: 'e-paragraph',
		selector: '.e-paragraph-base',
		defaultSize: '16px',
	},
	BUTTON: {
		type: 'e-button',
		selector: '.e-button-base',
		defaultSize: '15px',
	},
	// For backward compatibility with array-based access
	E_HEADING: {
		type: 'e-heading',
		selector: '.e-heading-base',
		defaultSize: '32px',
	},
	E_PARAGRAPH: {
		type: 'e-paragraph',
		selector: '.e-paragraph-base',
		defaultSize: '16px',
	},
	E_BUTTON: {
		type: 'e-button',
		selector: '.e-button-base',
		defaultSize: '15px',
	},
};

// Common font families
export const FONT_FAMILIES = {
	system: 'Arial',
	systemAlt: 'Times New Roman',
	google: 'Roboto',
	trebuchet: 'Trebuchet MS',
};

// Common font sizes
export const FONT_SIZES = {
	DESKTOP: '24',
	TABLET: '18',
	MOBILE: '16',
};

// Common spacing values
export const SPACING_VALUES = {
	POSITIVE: [ 1, 2.5, 5 ],
	NEGATIVE: [ -1, -2.5, -5 ],
	UNITS: [ 'px', 'em', 'rem', 'vw', 'vh', '%' ],
};

// Common test setup interface
export interface TypographyTestSetup {
	editor: EditorPage;
	wpAdmin: WpAdminPage;
	context: BrowserContext;
	page: Page;
}

// Common setup function for all typography tests
export async function setupTypographyTestSuite(
	browser: any, // eslint-disable-line @typescript-eslint/no-explicit-any
	apiRequests: any, // eslint-disable-line @typescript-eslint/no-explicit-any
	testInfo: any, // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<TypographyTestSetup> {
	const context = await browser.newContext();
	const page = await context.newPage();
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	await wpAdmin.setExperiments( { [ EXPERIMENT_NAME ]: 'active' } );

	return {
		editor: null as any, // eslint-disable-line @typescript-eslint/no-explicit-any -- Will be set in beforeEach
		wpAdmin,
		context,
		page,
	};
}

// Common teardown function
export async function teardownTypographyTestSuite(
	setup: TypographyTestSetup,
): Promise<void> {
	await setup.wpAdmin.resetExperiments();
	await setup.context.close();
}

// Common beforeEach function
export async function beforeEachTypographyTest(
	setup: TypographyTestSetup,
): Promise<void> {
	setup.editor = await setup.wpAdmin.openNewPage();
	await setup.editor.closeNavigatorIfOpen();
}

// Common helper function to setup widget and open typography section
export async function setupWidgetWithTypography(
	editor: EditorPage,
	widgetType: string,
): Promise<{ containerId: string; widgetId: string }> {
	const containerId = await editor.addElement( { elType: 'container' }, 'document' );
	const widgetId = await editor.addWidget( { widgetType, container: containerId } );

	await editor.openV2PanelTab( 'style' );
	await editor.openV2Section( 'typography' );
	await editor.v4Panel.waitForTypographyControls();

	return { containerId, widgetId };
}

// Common helper function to verify font size
export async function verifyFontSizePreview(
	editor: EditorPage,
	selector: string,
	expectedSize: string,
): Promise<void> {
	const frame = editor.getPreviewFrame();
	const element = frame.locator( selector );

	await expect( element ).toBeVisible( { timeout: timeouts.expect } );
	await expect( element ).toHaveCSS( 'font-size', `${ expectedSize }px`, { timeout: timeouts.expect } );
}

// Common helper function to verify font size with publishing
export async function verifyFontSizeWithPublishing(
	editor: EditorPage,
	page: Page,
	selector: string,
	expectedSize: string,
): Promise<void> {
	await verifyFontSizePreview( editor, selector, expectedSize );

	// Publish and verify
	await editor.publishAndViewPage();

	const publishedElement = page.locator( selector );
	await expect( publishedElement ).toBeVisible( { timeout: timeouts.navigation } );
	await expect( publishedElement ).toHaveCSS( 'font-size', `${ expectedSize }px`, { timeout: timeouts.expect } );
}

// Common helper function to verify letter spacing
export async function verifyLetterSpacing(
	editor: EditorPage,
	selector: string,
	expectedValue: number,
	expectedUnit: string,
): Promise<void> {
	const frame = editor.getPreviewFrame();
	const element = frame.locator( selector );
	await expect( element ).toBeVisible( { timeout: timeouts.expect } );

	await expect( async () => {
		const computedStyles = await element.evaluate( ( el ) => {
			const styles = window.getComputedStyle( el );
			return {
				letterSpacing: styles.letterSpacing,
				fontSize: parseFloat( styles.fontSize ),
				windowWidth: window.innerWidth,
				windowHeight: window.innerHeight,
			};
		} );

		if ( 0 === expectedValue ) {
			expect( [ 'normal', '0px', 'normal normal' ].includes( computedStyles.letterSpacing ) ).toBeTruthy();
			return;
		}

		const letterSpacingStr = computedStyles.letterSpacing;
		let computedValue;

		if ( 'normal' === letterSpacingStr || '0px' === letterSpacingStr ) {
			computedValue = 0;
		} else {
			const numericPart = letterSpacingStr.replace( /[^0-9.-]/g, '' );
			computedValue = parseFloat( numericPart );
		}

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
			case 'vh':
				expectedPixels = ( expectedValue * computedStyles.windowHeight ) / 100;
				break;
			case '%':
				// For percentage, it's relative to font size
				expectedPixels = ( expectedValue * computedStyles.fontSize ) / 100;
				break;
		}

		expect( computedValue ).toBeCloseTo( expectedPixels, 0 );
	} ).toPass( { timeout: timeouts.expect } );
}

// Common helper function to verify word spacing
export async function verifyWordSpacing(
	editor: EditorPage,
	selector: string,
	expectedValue: number,
	expectedUnit: string,
): Promise<void> {
	const frame = editor.getPreviewFrame();
	const element = frame.locator( selector );
	await expect( element ).toBeVisible( { timeout: timeouts.expect } );

	await expect( async () => {
		const computedStyles = await element.evaluate( ( el ) => {
			const styles = window.getComputedStyle( el );
			return {
				wordSpacing: styles.wordSpacing,
				fontSize: parseFloat( styles.fontSize ),
				windowWidth: window.innerWidth,
				windowHeight: window.innerHeight,
			};
		} );

		if ( 0 === expectedValue ) {
			expect( [ 'normal', '0px', 'normal normal' ].includes( computedStyles.wordSpacing ) ).toBeTruthy();
			return;
		}

		const wordSpacingStr = computedStyles.wordSpacing;
		let computedValue;

		if ( 'normal' === wordSpacingStr || '0px' === wordSpacingStr ) {
			computedValue = 0;
		} else {
			const numericPart = wordSpacingStr.replace( /[^0-9.-]/g, '' );
			computedValue = parseFloat( numericPart );
		}

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
			case 'vh':
				expectedPixels = ( expectedValue * computedStyles.windowHeight ) / 100;
				break;
			case '%':
				// For percentage, it's relative to font size
				expectedPixels = ( expectedValue * computedStyles.fontSize ) / 100;
				break;
		}

		expect( computedValue ).toBeCloseTo( expectedPixels, 0 );
	} ).toPass( { timeout: timeouts.expect } );
}

// Common helper function to verify font family
export async function verifyFontFamily(
	editor: EditorPage,
	selector: string,
	expectedFamily: string,
): Promise<void> {
	const frame = editor.getPreviewFrame();
	const element = frame.locator( selector );
	await expect( element ).toBeVisible( { timeout: timeouts.expect } );

	const computedFamily = await element.evaluate( ( e ) => window.getComputedStyle( e ).fontFamily );
	expect( computedFamily.toLowerCase() ).toContain( expectedFamily.toLowerCase() );
}

// Common helper function to verify font family with publishing
export async function verifyFontFamilyWithPublishing(
	editor: EditorPage,
	page: Page,
	selector: string,
	expectedFamily: string,
): Promise<void> {
	await verifyFontFamily( editor, selector, expectedFamily );

	// Publish and verify
	await editor.publishAndViewPage();

	const publishedElement = page.locator( selector );
	await expect( publishedElement ).toBeVisible( { timeout: timeouts.navigation } );
	const publishedComputedFamily = await publishedElement.evaluate( ( e ) => window.getComputedStyle( e ).fontFamily );
	expect( publishedComputedFamily.toLowerCase() ).toContain( expectedFamily.toLowerCase() );
}
