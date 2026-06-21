import { expect, type Locator } from '@playwright/test';
import { timeouts } from '../../../config/timeouts';

export const promotionPopoverSelector = '.MuiTooltip-tooltip > .MuiBox-root';

export function getPromotionWidget( category: Locator, widgetTitle: string ): Locator {
	return category.locator( '.elementor-element' ).filter( { hasText: widgetTitle } ).first();
}

export async function openPromotionPopover( widget: Locator ): Promise<Locator> {
	await widget.click( { force: true } );

	const popover = widget.page().locator( promotionPopoverSelector );
	await expect( popover ).toBeVisible( { timeout: timeouts.longAction } );

	return popover;
}
