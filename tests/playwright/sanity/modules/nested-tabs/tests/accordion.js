const { viewportSize } = require( '../../../../enums/viewport-sizes' );
const { expect } = require( '@playwright/test' );
const { selectDropdownContainer, clickMobileTab } = require( '../helper' );

async function testTabIsVisibleInAccordionView( page, editor, widgetId ) {
	// Act.
	await selectDropdownContainer( editor, widgetId, 0 );
	await page.locator( '.elementor-control-min_height .elementor-control-input-wrapper input' ).fill( '1000' );
	await selectDropdownContainer( editor, widgetId, 1 );
	await page.locator( '.elementor-control-min_height .elementor-control-input-wrapper input' ).fill( '1000' );
	await selectDropdownContainer( editor, widgetId, 2 );
	await page.locator( '.elementor-control-min_height .elementor-control-input-wrapper input' ).fill( '1000' );

	await editor.publishAndViewPage();
	await page.setViewportSize( viewportSize.mobile );

	const tabTitle1 = await page.locator( '.e-n-tabs > div:nth-child( 1 )' ),
		tabTitle2 = await page.locator( '.e-n-tabs > div:nth-child( 3 )' ),
		tabTitle3 = await page.locator( '.e-n-tabs > div:nth-child( 5 )' ),
		activeTabTitleSelector = '.e-n-tab-title[aria-selected=true]';

	await expect( tabTitle1 ).toHaveAttribute( 'aria-selected', 'true' );
	await expect( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
	await clickMobileTab( page, '1' );
	await expect( tabTitle2 ).toHaveAttribute( 'aria-selected', 'true' );
	await expect( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
	await clickMobileTab( page, '2' );
	await expect( tabTitle3 ).toHaveAttribute( 'aria-selected', 'true' );
	await expect( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
	await clickMobileTab( page, '1' );
	await expect( tabTitle2 ).toHaveAttribute( 'aria-selected', 'true' );
	await expect( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
	await clickMobileTab( page, '0' );
	await expect( tabTitle1 ).toHaveAttribute( 'aria-selected', 'true' );
	await expect( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
}

module.exports = {
	testTabIsVisibleInAccordionView,
};
