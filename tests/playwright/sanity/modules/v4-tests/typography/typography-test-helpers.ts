import { Browser, expect, TestInfo } from '@playwright/test';
import { DriverFactory } from '../../../../drivers/driver-factory';
import { EditorDriver } from '../../../../drivers/editor-driver';
import { timeouts } from '../../../../config/timeouts';
import ApiRequests from '../../../../assets/api-requests';

export const EXPERIMENT_NAME = 'e_atomic_elements';

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

export const FONT_FAMILIES = {
	system: 'Arial',
	systemAlt: 'Times New Roman',
	google: 'Roboto',
	trebuchet: 'Trebuchet MS',
};

export const FONT_SIZES = {
	DESKTOP: '24',
	TABLET: '18',
	MOBILE: '16',
};

export const SPACING_VALUES = {
	POSITIVE: [ 1, 2.5, 5 ],
	NEGATIVE: [ -1, -2.5, -5 ],
	UNITS: [ 'px', 'em', 'rem', 'vw', 'vh', '%' ],
};

export async function setupWidgetWithTypography(
	driver: EditorDriver,
	widgetType: string,
): Promise<{ containerId: string; widgetId: string }> {
	const result = await driver.setupPageWithWidget( widgetType );

	await driver.editor.openV2PanelTab( 'style' );
	await driver.editor.openV2Section( 'typography' );
	await driver.editor.v4Panel.style.typography.waitForTypographyControls();

	return { containerId: result.containerId, widgetId: result.widgetId };
}

export async function setWidgetTextContent(
	driver: EditorDriver,
	text: string,
	inputName: 'Title' | 'Text' | 'Button text' = 'Title',
): Promise<void> {
	await driver.editor.openV2PanelTab( 'general' );
	await driver.editor.v4Panel.general.setWidgetText( inputName, text );
}

export async function verifyFontSizePreview(
	driver: EditorDriver,
	selector: string,
	expectedSize: string,
): Promise<void> {
	const frame = driver.editor.getPreviewFrame();
	if ( ! frame ) {
		throw new Error( 'Preview frame is not available' );
	}
	const element = frame.locator( selector );

	await expect( element ).toBeVisible( { timeout: timeouts.expect } );
	await expect( element ).toHaveCSS( 'font-size', `${ expectedSize }px`, { timeout: timeouts.expect } );
}

export async function verifyFontSizeWithPublishing(
	driver: EditorDriver,
	selector: string,
	expectedSize: string,
): Promise<void> {
	await verifyFontSizePreview( driver, selector, expectedSize );

	await driver.editor.publishAndViewPage();

	const publishedElement = driver.page.locator( selector );
	await expect( publishedElement ).toBeVisible( { timeout: timeouts.navigation } );
	await expect( publishedElement ).toHaveCSS( 'font-size', `${ expectedSize }px`, { timeout: timeouts.expect } );
}

export async function verifySpacingEditor(
	driver: EditorDriver,
	selector: string,
	expectedValue: number,
	expectedUnit: string,
	cssProperty: 'letterSpacing' | 'wordSpacing',
): Promise<void> {
	const frame = driver.editor.getPreviewFrame();
	if ( ! frame ) {
		throw new Error( 'Preview frame is not available' );
	}
	const element = frame.locator( selector );
	await expect( element ).toBeVisible( { timeout: timeouts.expect } );

	await expect( async () => {
		const computedStyles = await element.evaluate( ( el, property ) => {
			const styles = window.getComputedStyle( el );
			return {
				spacing: styles[ property ],
				fontSize: parseFloat( styles.fontSize ),
				windowWidth: window.innerWidth,
				windowHeight: window.innerHeight,
			};
		}, cssProperty );

		if ( 0 === expectedValue ) {
			// For expected value 0, check if spacing is normal, 0px, or any value that evaluates to 0
			const spacingStr = computedStyles.spacing;
			if ( [ 'normal', '0px', 'normal normal' ].includes( spacingStr ) ) {
				return;
			}
			// If it's not one of the expected strings, check if the numeric value is 0
			const numericPart = spacingStr.replace( /[^0-9.-]/g, '' );
			const numericValue = parseFloat( numericPart );
			expect( numericValue ).toBeCloseTo( 0, 0 );
			return;
		}

		const spacingStr = computedStyles.spacing;
		let computedValue;

		if ( 'normal' === spacingStr || '0px' === spacingStr ) {
			computedValue = 0;
		} else {
			const numericPart = spacingStr.replace( /[^0-9.-]/g, '' );
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


export async function verifyFontEditor(
	driver: EditorDriver,
	selector: string,
	expectedFamily: string,
): Promise<void> {
	const frame = driver.editor.getPreviewFrame();
	if ( ! frame ) {
		throw new Error( 'Preview frame is not available' );
	}
	const element = frame.locator( selector );
	await expect( element ).toBeVisible( { timeout: timeouts.expect } );

	const computedFamily = await element.evaluate( ( e ) => window.getComputedStyle( e ).fontFamily );
	expect( computedFamily.toLowerCase() ).toContain( expectedFamily.toLowerCase() );
}

export async function verifyFontFamilyWithPublishing(
	driver: EditorDriver,
	selector: string,
	expectedFamily: string,
): Promise<void> {
	await verifyFontEditor( driver, selector, expectedFamily );

	await driver.editor.publishAndViewPage();

	const publishedElement = driver.page.locator( selector );
	await expect( publishedElement ).toBeVisible( { timeout: timeouts.navigation } );
	const publishedComputedFamily = await publishedElement.evaluate( ( e ) => window.getComputedStyle( e ).fontFamily );
	expect( publishedComputedFamily.toLowerCase() ).toContain( expectedFamily.toLowerCase() );
}
