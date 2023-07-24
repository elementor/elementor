import { viewportSize } from '../../../../enums/viewport-sizes';
import { expect, type Page } from '@playwright/test';
import { selectDropdownContainer, clickMobileTab } from '../helper';
import EditorPage from '../../../../pages/editor-page';

export async function testTabIsVisibleInAccordionView( page: Page, editor: EditorPage ) {
	// Act.
	await selectDropdownContainer( editor, '0' );
	await page.locator( '.elementor-control-min_height .elementor-control-input-wrapper input' ).fill( '1000' );
	await selectDropdownContainer( editor, '1' );
	await page.locator( '.elementor-control-min_height .elementor-control-input-wrapper input' ).fill( '1000' );
	await selectDropdownContainer( editor, '2' );
	await page.locator( '.elementor-control-min_height .elementor-control-input-wrapper input' ).fill( '1000' );

	await editor.publishAndViewPage();
	await page.setViewportSize( viewportSize.mobile );

	const tabTitle1 = page.locator( '.e-n-tabs-content > div:nth-child( 1 )' ),
		tabTitle2 = page.locator( '.e-n-tabs-content > div:nth-child( 3 )' ),
		tabTitle3 = page.locator( '.e-n-tabs-content > div:nth-child( 5 )' ),
		activeTabTitleSelector = '.e-collapse.e-active';

	await expect( tabTitle1 ).toHaveClass( /e-active/ );
	expect( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
	await clickMobileTab( page, '1' );
	await expect( tabTitle2 ).toHaveClass( /e-active/ );
	expect( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
	await clickMobileTab( page, '2' );
	await expect( tabTitle3 ).toHaveClass( /e-active/ );
	expect( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
	await clickMobileTab( page, '1' );
	await expect( tabTitle2 ).toHaveClass( /e-active/ );
	expect( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
	await clickMobileTab( page, '0' );
	await expect( tabTitle1 ).toHaveClass( /e-active/ );
	expect( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
}

module.exports = {
	testTabIsVisibleInAccordionView,
};
