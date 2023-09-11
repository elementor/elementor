import { viewportSize } from '../../../../enums/viewport-sizes';
import { expect, type Page, test } from '@playwright/test';
import { selectDropdownContainer, clickTab } from '../helper';
import EditorPage from '../../../../pages/editor-page';

export async function testTabsInAccordionView( page: Page, editor: EditorPage ) {
	await test.step( 'Set minimum height to the content containers', async () => {
		// Act.
		await selectDropdownContainer( editor, '', 0 );
		await page.locator( '.elementor-control-min_height .elementor-control-input-wrapper input' ).fill( '1000' );
		await selectDropdownContainer( editor, '', 1 );
		await page.locator( '.elementor-control-min_height .elementor-control-input-wrapper input' ).fill( '1000' );
		await selectDropdownContainer( editor, '', 2 );
		await page.locator( '.elementor-control-min_height .elementor-control-input-wrapper input' ).fill( '1000' );

		await editor.publishAndViewPage();
	} );

	const secondTab = await page.locator( '.e-n-tab-title >> nth=1' ),
		widget = await page.locator( '.e-n-tabs' );

	await test.step( 'Verify hover styling', async () => {
		await secondTab.hover();

		expect.soft( await widget.screenshot( {
			type: 'png',
		} ) ).toMatchSnapshot( 'tabs-with-hover-desktop.png' );
	} );

	await test.step( 'Verify hover styling on mobile', async () => {
		await page.setViewportSize( viewportSize.mobile );

		await secondTab.hover();

		expect.soft( await widget.screenshot( {
			type: 'png',
		} ) ).toMatchSnapshot( 'tabs-with-hover-mobile.png' );
	} );

	await test.step( 'Verify that active items are in viewport', async () => {
		const tabContainer1 = await page.locator( '.e-n-tabs-content > div:nth-child( 1 )' ),
			tabContainer2 = await page.locator( '.e-n-tabs-content > div:nth-child( 2 )' ),
			tabContainer3 = await page.locator( '.e-n-tabs-content > div:nth-child( 3 )' ),
			activeTabTitleSelector = '.e-n-tab-title[aria-selected="true"]';

		await expect.soft( tabContainer1 ).toHaveCSS( 'display', 'flex' );
		await expect.soft( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
		await clickTab( page, 1 );
		await expect.soft( tabContainer2 ).toHaveClass( /e-active/ );
		await expect.soft( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
		await clickTab( page, 2 );
		await expect.soft( tabContainer3 ).toHaveClass( /e-active/ );
		await expect.soft( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
		await clickTab( page, 1 );
		await expect.soft( tabContainer2 ).toHaveClass( /e-active/ );
		await expect.soft( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
		await clickTab( page, 0 );
		await expect.soft( tabContainer1 ).toHaveClass( /e-active/ );
		await expect.soft( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
	} );
}
