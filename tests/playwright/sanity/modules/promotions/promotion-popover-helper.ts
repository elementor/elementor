import { expect, type Locator, type Page } from '@playwright/test';
import { timeouts } from '../../../config/timeouts';

export const promotionPopoverSelector = '.MuiTooltip-tooltip > .MuiBox-root';
const WIDGET_SEARCH_INPUT = 'input#elementor-panel-elements-search-input';
const MIN_EXPANDED_CATEGORY_ITEMS_HEIGHT = 20;

export function getPromotionWidget( category: Locator, widgetTitle: string ): Locator {
	return category.locator( '.elementor-element' ).filter( { hasText: widgetTitle } ).first();
}

export function getPromotionWidgetByType( category: Locator, elementType: string ): Locator {
	return category.locator( `[data-library-element-type="${ elementType }"]` ).first();
}

/**
 * Category titles toggle. Clicking an already-open accordion collapses it and hides the tiles
 * mid-animation — the original carousel flake.
 *
 * @param {Locator} category Panel category root (`#elementor-panel-category-*`).
 */
export async function expandPanelCategory( category: Locator ): Promise<void> {
	const items = category.locator( '.elementor-panel-category-items' );
	const isActive = await category.evaluate( ( element ) => element.classList.contains( 'elementor-active' ) );

	if ( ! isActive ) {
		await category.locator( '.elementor-panel-category-title' ).click();
	}

	await expect( items ).toBeVisible();
	await expect.poll(
		async () => items.evaluate( ( element ) => element.getBoundingClientRect().height ),
		{ timeout: timeouts.longAction },
	).toBeGreaterThan( MIN_EXPANDED_CATEGORY_ITEMS_HEIGHT );
}

export async function searchPanelWidgets( page: Page, searchTerm: string ): Promise<void> {
	const searchInput = page.locator( WIDGET_SEARCH_INPUT );
	await expect( searchInput ).toBeVisible();
	await searchInput.fill( searchTerm );
	await searchInput.dispatchEvent( 'input' );
}

function getWidgetWrapper( widget: Locator ): Locator {
	return widget.locator( 'xpath=ancestor::div[contains(@class,"elementor-element-wrapper")][1]' );
}

export async function openPromotionPopover(
	widget: Locator,
	options?: { hasText?: string | RegExp },
): Promise<Locator> {
	const wrapper = getWidgetWrapper( widget );

	await wrapper.evaluate( ( element ) => {
		element.scrollIntoView( { block: 'center', inline: 'nearest', behavior: 'instant' } );
	} );
	await expect( wrapper ).toBeVisible();

	// Promotion cards open on mousedown of the wrapper (not the inner button). Skip force:
	// actionability waits until the tile is stable after accordion/search layout.
	await wrapper.click();

	const popover = options?.hasText
		? widget.page().locator( promotionPopoverSelector ).filter( { hasText: options.hasText } )
		: widget.page().locator( promotionPopoverSelector );

	await expect( popover ).toBeVisible( { timeout: timeouts.longAction } );

	return popover;
}
