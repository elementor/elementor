import { expect } from '@playwright/test';
import { EditorDriver } from '../../../../drivers/editor-driver';
import { timeouts } from '../../../../config/timeouts';
import { STYLE_SECTIONS } from '../../../../pages/atomic-elements-panel/style-tab';
import { convertToPixels } from '../../../../utils/unit-conversions';

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
	POSITIVE: [ 1, 5.5 ],
	NEGATIVE: [ -1, -5.5 ],
	UNITS: [ 'px', 'em', 'rem', 'vw', 'vh', '%' ],
};

export async function setupWidgetWithTypography(
	driver: EditorDriver,
	widgetType: string,
	expandSection = true,
): Promise<{ containerId: string; widgetId: string }> {
	const containerId = await driver.editor.addElement( { elType: 'container' }, 'document' );
	const widgetId = await driver.editor.addWidget( { widgetType, container: containerId } );

	await driver.editor.openV2PanelTab( 'style' );
	await driver.editor.openV2Section( 'typography' );

	if ( expandSection ) {
		await driver.editor.v4Panel.style.clickShowMore( STYLE_SECTIONS.TYPOGRAPHY );
	}

	return { containerId, widgetId };
}

export async function verifyFontSizePreview(
	driver: EditorDriver,
	selector: string,
	expectedSize: string,
): Promise<void> {
	const frame = driver.editor.getPreviewFrame();
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

function verifyZeroSpacing( spacingStr: string ): void {
	if ( [ 'normal', '0px', 'normal normal' ].includes( spacingStr ) ) {
		return;
	}
	const numericPart = spacingStr.replace( /[^0-9.-]/g, '' );
	const numericValue = parseFloat( numericPart );
	expect( numericValue ).toBeCloseTo( 0, 0 );
}

function parseSpacingValue( spacingStr: string ): number {
	if ( [ 'normal', '0px' ].includes( spacingStr ) ) {
		return 0;
	}
	const numericPart = spacingStr.replace( /[^0-9.-]/g, '' );
	return parseFloat( numericPart );
}

export async function verifySpacingEditor(params:
	{
		driver: EditorDriver,
		selector: string,
		expectedValue: number,
		expectedUnit: string,
		cssProperty: 'letterSpacing' | 'wordSpacing',
	}): Promise<void> {
	const { driver, selector, expectedValue, expectedUnit, cssProperty } = params;
}
	const frame = driver.editor.getPreviewFrame();
	const element = frame.locator( selector );

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
			verifyZeroSpacing( computedStyles.spacing );
			return;
		}

		const computedValue = parseSpacingValue( computedStyles.spacing );
		const expectedPixels = convertToPixels( expectedValue, expectedUnit, computedStyles );
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
