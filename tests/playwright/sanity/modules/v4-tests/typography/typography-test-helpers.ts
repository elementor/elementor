import { expect } from '@playwright/test';
import { EditorDriver } from '../../../../drivers/editor-driver';
import { timeouts } from '../../../../config/timeouts';
import { STYLE_SECTIONS } from '../../../../pages/atomic-elements-panel/style-tab';
import { convertToPixels } from '../../../../utils/unit-conversions';

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
	const element = driver.editor.getPreviewFrame().locator( selector );
	await expect( element ).toHaveCSS( 'font-size', `${ expectedSize }px`, { timeout: timeouts.expect } );
}

export async function verifyFontSizeOnFrontend(
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

export async function verifySpacingEditor( params:
	{
		driver: EditorDriver,
		selector: string,
		expectedValue: number,
		expectedUnit: string,
		cssProperty: 'letterSpacing' | 'wordSpacing',
	} ): Promise<void> {
	const { driver, selector, expectedValue, expectedUnit, cssProperty } = params;
	const element = driver.editor.getPreviewFrame().locator( selector );

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
	const element = driver.editor.getPreviewFrame().locator( selector );
	const computedFamily = await element.evaluate( ( e ) => window.getComputedStyle( e ).fontFamily );
	expect( computedFamily.toLowerCase() ).toContain( expectedFamily.toLowerCase() );
}

export async function verifyFontFamilyOnFrontend(
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
