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

	await editor.selectElement( growerID );
	await editor.setSliderControlValue( 'space', '40' );
	await editor.selectElement( buttonID );
	await editor.setTextControlValue( 'url-external-show', `#${ anchorId }` );
	await editor.selectElement( scrollSpacerID );
	await editor.setSliderControlValue( 'space', '1500' );
	await editor.selectElement( targetID );
	await editor.openPanelTab( 'advanced' );
	await editor.setTextControlValue( '_element_id', anchorId );

	const preview = editor.getPreviewFrame();
	const button = preview.locator( `[data-id="${ buttonID }"] a.elementor-button-link` );
	const target = preview.locator( `[data-id="${ targetID }"]` );

	await button.evaluate( ( anchor, growerElementId ) => {
		anchor.addEventListener( 'click', () => {
			setTimeout( () => {
				const grower = document.querySelector( `[data-id="${ growerElementId }"] .elementor-spacer-inner` );
				if ( grower ) {
					grower.style.height = '420px';
				}
			}, 80 );
		}, { capture: true } );
	}, growerID );
	await button.click();

	await expect.poll( async () => Math.abs( await target.evaluate( ( el ) => el.getBoundingClientRect().top ) ), {
		timeout: timeouts.action,
	} ).toBeLessThan( 80 );
	await expect( target ).toBeInViewport();
} );
