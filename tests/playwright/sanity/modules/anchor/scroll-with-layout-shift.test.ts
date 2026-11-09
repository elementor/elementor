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
	const scrollSpacerID = await editor.addWidget( { widgetType: 'spacer', container } );
	const targetID = await editor.addWidget( { widgetType: 'heading', container } );
	// Room below the target, otherwise the page bottom caps the scroll before the target reaches the top.
	const bottomSpacerID = await editor.addWidget( { widgetType: 'spacer', container } );

	await editor.selectElement( growerID );
	await editor.setSliderControlValue( 'space', '40' );
	await editor.selectElement( buttonID );
	await editor.setTextControlValue( 'url-external-show', `#${ anchorId }` );
	await editor.selectElement( scrollSpacerID );
	await editor.setSliderControlValue( 'space', '1500' );
	await editor.selectElement( bottomSpacerID );
	await editor.setSliderControlValue( 'space', '1500' );
	await editor.selectElement( targetID );
	await editor.openPanelTab( 'advanced' );
	await editor.setTextControlValue( '_element_id', anchorId );

	const preview = editor.getPreviewFrame();
	const button = preview.locator( `[data-id="${ buttonID }"] a.elementor-button-link` );
	const target = preview.locator( `[data-id="${ targetID }"]` );
	const grower = preview.locator( `[data-id="${ growerID }"] .elementor-spacer-inner` );

	await button.click();
	// Grow content above the target while the smooth scroll is still running.
	await grower.evaluate( ( element ) => {
		element.style.height = '420px';
	} );

	await expect.poll( async () => Math.abs( await target.evaluate( ( el ) => el.getBoundingClientRect().top ) ), {
		timeout: timeouts.longAction,
	} ).toBeLessThan( 80 );
} );
