import { viewportSize } from '../../../../enums/viewport-sizes';
import { expect, type Page } from '@playwright/test';
import { selectDropdownContainer, clickTab } from '../helper';
import EditorPage from '../../../../pages/editor-page';

export async function testTabIsVisibleInAccordionView( page: Page, editor: EditorPage ) {
	// Act.
	await selectDropdownContainer( editor, '', 0 );
	await editor.setSliderControlValue( 'min_height', '1000' );
	await selectDropdownContainer( editor, '', 1 );
	await editor.setSliderControlValue( 'min_height', '1000' );
	await selectDropdownContainer( editor, '', 2 );
	await editor.setSliderControlValue( 'min_height', '1000' );

	await editor.publishAndViewPage();
	await page.setViewportSize( viewportSize.mobile );

	const tabContainer1 = page.locator( '.e-n-tabs-content > div:nth-child( 1 )' ),
		tabContainer2 = page.locator( '.e-n-tabs-content > div:nth-child( 2 )' ),
		tabContainer3 = page.locator( '.e-n-tabs-content > div:nth-child( 3 )' ),
		activeTabTitleSelector = '.e-n-tab-title[aria-selected="true"]';

	await expect.soft( tabContainer1 ).toHaveCSS( 'display', 'flex' );
	expect.soft( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
	await clickTab( page, 1 );
	await expect.soft( tabContainer2 ).toHaveClass( /e-active/ );
	expect.soft( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
	await clickTab( page, 2 );
	await expect.soft( tabContainer3 ).toHaveClass( /e-active/ );
	expect.soft( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
	await clickTab( page, 1 );
	await expect.soft( tabContainer2 ).toHaveClass( /e-active/ );
	expect.soft( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
	await clickTab( page, 0 );
	await expect.soft( tabContainer1 ).toHaveClass( /e-active/ );
	expect.soft( await editor.isItemInViewport( activeTabTitleSelector ) ).toBeTruthy();
}
