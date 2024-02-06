import { type Page, expect } from '@playwright/test';

// Set icons to tabs, used in setIconsToTabs function.
export async function widgetControlPromotionModalScreenshotTest( page: Page, element: string ) {
	await page.locator( `.e-control-${ element }-promotion` ).click( { force: true } );
	const modalContainer = page.locator( '#elementor-element--promotion__dialog' );
	await expect.soft( modalContainer ).toHaveScreenshot( `${ element }-modal.png` );
	await page.locator( '.dialog-header .eicon-close' ).click();
}
