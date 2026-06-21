import { expect, type Locator } from '@playwright/test';
import { timeouts } from '../../../config/timeouts';

export const promotionPopoverSelector = '.MuiTooltip-tooltip > .MuiBox-root';

export function getPromotionWidgetWrapper( category: Locator, iconClass: string ): Locator {
	return category.locator( '.elementor-element-wrapper' ).filter( {
		has: category.locator( `.${ iconClass }` ),
	} );
}

export async function openPromotionPopover( widgetWrapper: Locator ): Promise<Locator> {
	await widgetWrapper.dispatchEvent( 'mousedown' );

	const popover = widgetWrapper.page().locator( promotionPopoverSelector );
	await expect( popover ).toBeVisible( { timeout: timeouts.longAction } );

	return popover;
}
