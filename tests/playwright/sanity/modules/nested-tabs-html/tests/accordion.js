const { viewportSize } = require( '../../../../enums/viewport-sizes' );
const { expect } = require( '@playwright/test' );
const { selectDropdownContainer, clickTab } = require( '../helper' );

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

	const tabContainer1 = await page.locator( '.e-n-tabs-content > div:nth-child( 1 )' ),
		tabContainer2 = await page.locator( '.e-n-tabs-content > div:nth-child( 2 )' ),
		tabContainer3 = await page.locator( '.e-n-tabs-content > div:nth-child( 3 )' ),
		activeTabTitleSelector = '.e-n-tab-title[aria-selected=true]';

	await expect.soft( tabContainer1 ).toHaveCSS( 'display', 'flex' );
	await expect.soft( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
	await clickTab( page, '1' );
	await expect.soft( tabContainer2 ).toHaveClass( /e-active/ );
	await expect.soft( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
	await clickTab( page, '2' );
	await expect.soft( tabContainer3 ).toHaveClass( /e-active/ );
	await expect.soft( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
	await clickTab( page, '1' );
	await expect.soft( tabContainer2 ).toHaveClass( /e-active/ );
	await expect.soft( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
	await clickTab( page, '0' );
	await expect.soft( tabContainer1 ).toHaveClass( /e-active/ );
	await expect.soft( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
}

module.exports = {
	testTabIsVisibleInAccordionView,
};
