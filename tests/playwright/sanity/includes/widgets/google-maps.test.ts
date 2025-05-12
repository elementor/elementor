import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import GoogleMaps from '../../../pages/widgets/google-maps';

test( 'Verify Google maps controls', async ( { page, apiRequests }, testInfo ) => {
	// Arrange
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	const editor = new EditorPage( page, testInfo );
	const googleMapsWidget = new GoogleMaps( page, testInfo );
	const setValues = {
		location: 'New York',
		height: '600',
		zoom: '12',
	};
	const expectedValues = {
		q: 'New%20York',
		t: 'm',
		z: '12',
		output: 'embed',
		iwloc: 'near',
	};

	await wpAdmin.openNewPage();
	await editor.closeNavigatorIfOpen();

	// Act - Add Google Maps widget.
	await editor.addWidget( { widgetType: 'google_maps' } );
	await editor.setTextControlValue( 'address', setValues.location );
	await editor.setSliderControlValue( 'zoom', setValues.zoom );
	await editor.setSliderControlValue( 'height', setValues.height );
	await editor.waitForIframeToLoaded( 'google_maps' );

	// Assert - Verify the Google Maps widget in the editor.
	let src = await googleMapsWidget.getSrc();
	let currentHeight = await googleMapsWidget.getHeight();
	expect( String( currentHeight ) ).toEqual( setValues.height );
	googleMapsWidget.verifySrcParams( src, expectedValues, 'google-maps' );

	// Assert - Verify the Google Maps widget in the front-end.
	await editor.publishAndViewPage();
	src = await googleMapsWidget.getSrc( true );
	googleMapsWidget.verifySrcParams( src, expectedValues, 'google-maps' );
	currentHeight = await googleMapsWidget.getHeight( true );
	expect( String( currentHeight ) ).toEqual( setValues.height );
} );
