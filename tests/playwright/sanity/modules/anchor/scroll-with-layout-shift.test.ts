import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import { timeouts } from '../../../config/timeouts';
import WpAdminPage from '../../../pages/wp-admin-page';

test( 'Anchor scroll realigns when layout above grows @anchor-scroll-layout-shift', async ( { page, apiRequests }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	const anchorId = 'layout_shift_anchor';
	const editor = await wpAdmin.openNewPage();
	const container = await editor.addElement( { elType: 'container' }, 'document' );
	const growerID = await editor.addWidget( { widgetType: 'spacer', container } );
	const buttonID = await editor.addWidget( { widgetType: 'button', container } );
	const targetID = await editor.addWidget( { widgetType: 'heading', container } );

	await editor.selectElement( growerID );
	await editor.setSliderControlValue( 'space', '40' );
	await editor.selectElement( buttonID );
	await editor.setTextControlValue( 'url-external-show', `#${ anchorId }` );
	await editor.selectElement( targetID );
	await editor.openPanelTab( 'advanced' );
	await editor.setTextControlValue( '_element_id', anchorId );
	const spacerID = await editor.addWidget( { widgetType: 'spacer', container } );
	await editor.selectElement( spacerID );
	await editor.setSliderControlValue( 'space', '1400' );

	const preview = editor.getPreviewFrame();
	await preview.locator( `[data-id="${ buttonID }"] a.elementor-button-link` ).click();
	await preview.locator( `[data-id="${ growerID }"]` ).evaluate( ( el ) => {
		el.style.height = '420px';
	} );
	const target = preview.locator( `[data-id="${ targetID }"]` );
	await expect( target ).toBeInViewport( { timeout: timeouts.action } );
	expect( Math.abs( await target.evaluate( ( el ) => el.getBoundingClientRect().top ) ) ).toBeLessThan( 80 );
} );
