import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import GoogleMaps from '../../../pages/widgets/google-maps';

test( 'Verify Google maps controls', async ( { page, apiRequests }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	const editor = new EditorPage( page, testInfo );
	const googleMapsWidget = new GoogleMaps( page, testInfo );
	const height = '600';
	const zoom = '12';
	const location = 'New York';

	await wpAdmin.openNewPage();
	await editor.closeNavigatorIfOpen();
	await editor.addWidget( 'google_maps' );
	await googleMapsWidget.setGoogleMapsParams( { location, zoom, height } );
	let src = await googleMapsWidget.getSrc();
	const expectedValues = {
		q: 'New%20York',
		t: 'm',
		z: zoom,
		output: 'embed',
		iwloc: 'near',
	};
	let currentHeight = await googleMapsWidget.getHeight();
	expect( String( currentHeight ) ).toEqual( height );
	googleMapsWidget.verifySrcParams( src, expectedValues, 'google-maps' );

	await editor.publishAndViewPage();

	src = await googleMapsWidget.getSrc( true );
	googleMapsWidget.verifySrcParams( src, expectedValues, 'google-maps' );
	currentHeight = await googleMapsWidget.getHeight( true );
	expect( String( currentHeight ) ).toEqual( height );
} );

test( 'Check that Google Maps widget css file is loaded from `assets/css` when `Improved CSS Loading` experiment is active and SCRIPT_DEBUG is false', async ( { page, apiRequests }, testInfo ) => {
	// Arrange.
	const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );

	await wpAdminPage.setExperiments( { e_optimized_css_loading: true } );

	const editorPage = await wpAdminPage.openNewPage(),
		container = await editorPage.addElement( { elType: 'container' }, 'document' );

	// Add widgets.
	await editorPage.addWidget( 'google_maps', container );
	await editorPage.getPreviewFrame().locator( '.elementor-widget-google_maps' ).waitFor();

	// Act
	await editorPage.publishAndViewPage();

	// When the `Improved CSS Loading` experiment is active, the Google Maps css file is loaded from `assets/css`.
	const proFilePath = await page.evaluate( () => document.querySelector( '.elementor-widget-google_maps > .elementor-widget-container > link' ).getAttribute( 'href' ) ),
		isProFilePath = proFilePath.includes( 'assets/css/widget' ),
		proFileArray = proFilePath.split( '?ver=' ),
		proFileTimestamp = proFileArray[ 1 ];

	// Assert
	expect.soft( isProFilePath ).toBeTruthy();
	expect.soft( proFileTimestamp ).toBeDefined();

	await wpAdminPage.setExperiments( { e_optimized_css_loading: false } );
} );
