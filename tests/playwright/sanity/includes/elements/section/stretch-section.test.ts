import { test, expect, type Page } from '@playwright/test';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';

test( 'Stretch section', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo );

	try {
		let editor = await wpAdmin.openNewPage();
		await testStretchedSection( page, editor, 'ltr' );

		await wpAdmin.setSiteLanguage( 'he_IL' );
		editor = await wpAdmin.openNewPage();
		await testStretchedSection( page, editor, 'rtl' );
	} finally {
		await wpAdmin.setSiteLanguage( '' );
	}
} );

async function testStretchedSection( page: Page, editor: EditorPage, direction: string ) {
	await editor.closeNavigatorIfOpen();

	await editor.getPreviewFrame().evaluate( () => {
		const sectionWrap: HTMLElement = document.querySelector( '.elementor-section-wrap:first-child' );

		sectionWrap.style.width = '800px';
		sectionWrap.style.margin = '0 auto';
	} );

	// Act.
	const sectionID = await editor.addElement( { elType: 'section' }, 'document' ),
		sectionElement = editor.getPreviewFrame().locator( `.elementor-element-${ sectionID }` );

	await editor.selectElement( sectionID );
	await editor.openPanelTab( 'style' );
	await editor.openSection( 'section_background' );
	await editor.setChooseControlValue( 'background_background', 'eicon-paint-brush' );
	await editor.setColorControlValue( 'background_color', '#ef9595' );
	await editor.openPanelTab( 'layout' );
	await editor.setSelectControlValue( 'layout', 'boxed' );

	const spacerID = await editor.addWidget( 'spacer', sectionID, true );
	await editor.selectElement( spacerID );
	await editor.setSliderControlValue( 'space', '200' );
	await editor.openPanelTab( 'advanced' );
	await editor.openSection( '_section_background' );
	await editor.setChooseControlValue( '_background_background', 'eicon-paint-brush' );
	await editor.setColorControlValue( '_background_color', '#cae0bc' );

	const directionSuffix = 'ltr' === direction ? '' : '-rtl';

	/**
	 * Test in Editor
	 */
	// Assert (Not Stretched).
	expect( await sectionElement.screenshot( {
		type: 'jpeg',
		quality: 90,
	} ) ).toMatchSnapshot( `section-NOT-stretched${ directionSuffix }.jpeg` );

	// Act.
	await editor.selectElement( sectionID );
	await editor.setSwitcherControlValue( 'stretch_section', true );

	// Assert (Stretched).
	expect( await sectionElement.screenshot( {
		type: 'jpeg',
		quality: 90,
	} ) ).toMatchSnapshot( `section-stretched${ directionSuffix }.jpeg` );

	if ( 'rtl' === direction ) {
		const isSectionConsideringScrollbar = await editor.getPreviewFrame().evaluate( ( { selector } ) => {
			const section = document.querySelector( '.elementor-element-' + selector ),
				sectionBoundingBox = section.getBoundingClientRect(),
				scrollbarWidth = window.innerWidth - document.body.clientWidth;

			return sectionBoundingBox.left === scrollbarWidth && sectionBoundingBox.right === window.innerWidth;
		}, { selector: sectionID } );

		expect( isSectionConsideringScrollbar ).toBe( true );
	}

	/**
	 * Test in Front End
	 */
	// Arrange.
	await editor.publishAndViewPage();

	// Act.
	await page.evaluate( () => {
		const sectionWrap: HTMLElement = document.querySelector( 'div[data-elementor-type="wp-page"]' );

		sectionWrap.style.width = '960px';
		sectionWrap.style.margin = '0 auto';

		window.dispatchEvent( new Event( 'resize' ) );
	} );

	const sectionElementFE = page.locator( `.elementor-element-${ sectionID }` );

	// Assert (Stretched).
	expect( await sectionElementFE.screenshot( {
		type: 'jpeg',
		quality: 90,
	} ) ).toMatchSnapshot( `section-stretched-FE${ directionSuffix }.jpeg` );
}
