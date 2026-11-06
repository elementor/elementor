import type { Locator, Page } from '@playwright/test';
import { PROMO_CHROME_SELECTORS } from './constants';

const hideNodesForScreenshot = async ( page: Page, selector: string ): Promise<void> => {
	await page.locator( selector ).evaluateAll( ( nodes ) => {
		nodes.forEach( ( node ) => {
			( node as HTMLElement ).style.display = 'none';
		} );
	} );
};

export const hidePromoChromeForScreenshot = async ( page: Page ): Promise<void> => {
	const selector = PROMO_CHROME_SELECTORS.join( ', ' );
	await hideNodesForScreenshot( page, selector );
};

export const hidePanelNewBadgesForScreenshot = async ( page: Page ): Promise<void> => {
	await hideNodesForScreenshot( page, '#elementor-panel .e-widget-new-badge' );
};

export const promoChromeScreenshotMasks = ( page: Page ): Locator[] => {
	return PROMO_CHROME_SELECTORS.map( ( promoSelector ) => page.locator( promoSelector ) );
};
