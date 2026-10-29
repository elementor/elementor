import type { Locator, Page } from '@playwright/test';
import { PROMO_CHROME_SELECTORS } from './constants';

export const hidePromoChromeForScreenshot = async ( page: Page ): Promise<void> => {
	const selector = PROMO_CHROME_SELECTORS.join( ', ' );

	await page.locator( selector ).evaluateAll( ( nodes ) => {
		nodes.forEach( ( node ) => {
			( node as HTMLElement ).style.visibility = 'hidden';
		} );
	} );
};

export const promoChromeScreenshotMasks = ( page: Page ): Locator[] => {
	return PROMO_CHROME_SELECTORS.map( ( promoSelector ) => page.locator( promoSelector ) );
};
