import { expect, type Page } from '@playwright/test';
import { clickTab } from '../helper';
import EditorPage from '../../../../pages/editor-page';

export async function testTitlesWithHTML( page: Page, editor: EditorPage ) {
	// Act.
	await clickTab( editor.getPreviewFrame(), 2 );
	await page.locator( '.elementor-control-tabs .elementor-repeater-fields:last-child' ).click();
	await page.locator( '.elementor-control-tabs .elementor-repeater-fields:last-child .elementor-control-tab_title input' ).fill( '<div style="display: flex; flex-direction: column;"><strong class="test-class">Tab 3</strong><div> has<br />html <br />elements</div></div>' );

	const activeTab = editor.getPreviewFrame().locator( '.e-n-tab-title[aria-selected="true"]' );

	expect.soft( await activeTab.screenshot( {
		type: 'png',
	} ) ).toMatchSnapshot( 'tab-title-with-html.png' );

	await page.locator( '.elementor-control-tabs .elementor-repeater-fields:last-child .elementor-control-tab_title input' ).fill( 'Tab #3' );
}
