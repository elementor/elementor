import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import { timeouts } from '../../../config/timeouts';
import WpAdminPage from '../../../pages/wp-admin-page';

test.describe( 'Anchor scroll with layout shift @anchor-scroll-layout-shift', () => {
	test( 'Anchor link realigns when content above grows during scroll', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const scrollToID = 'layout_shift_anchor';
		const editor = await wpAdmin.openNewPage(),
			container = await editor.addElement( { elType: 'container' }, 'document' ),
			growerID = await editor.addWidget( { widgetType: 'spacer', container } ),
			buttonID = await editor.addWidget( { widgetType: 'button', container } ),
			spacerID = await editor.addWidget( { widgetType: 'spacer', container } ),
			elemWithID = await editor.addWidget( { widgetType: 'heading', container } );

		await editor.selectElement( growerID );
		await editor.setSliderControlValue( 'space', '50' );

		await editor.selectElement( buttonID );
		await editor.setTextControlValue( 'url-external-show', `#${ scrollToID }` );

		await editor.selectElement( elemWithID );
		await editor.openPanelTab( 'advanced' );
		await editor.setTextControlValue( '_element_id', scrollToID );

		await editor.selectElement( spacerID );
		await editor.setSliderControlValue( 'space', '1500' );

		const previewFrame = editor.getPreviewFrame();

		await previewFrame.evaluate( ( growerElementId ) => {
			const grower = document.querySelector( `[data-id="${ growerElementId }"]` );

			if ( ! grower ) {
				return;
			}

			grower.setAttribute( 'data-anchor-grower', '1' );
		}, growerID );

		const buttonElem = previewFrame.locator( `[data-id="${ buttonID }"] a.elementor-button-link` );

		await buttonElem.click();

		await previewFrame.evaluate( ( growerElementId ) => {
			const grower = document.querySelector( `[data-id="${ growerElementId }"]` ) as HTMLElement | null;

			if ( ! grower ) {
				return;
			}

			grower.style.minHeight = '400px';
			grower.style.height = '400px';
		}, growerID );

		const scrollToElem = previewFrame.locator( `[data-id="${ elemWithID }"]` );

		await expect( scrollToElem ).toBeInViewport( { timeout: timeouts.action } );

		const anchorTop = await scrollToElem.evaluate( ( element ) => element.getBoundingClientRect().top );

		expect( Math.abs( anchorTop ) ).toBeLessThan( 80 );
	} );
} );
