import { allowPipelineMimeTypes } from 'elementor-editor-utils/wp-media-upload-pipeline';

describe( 'allowPipelineMimeTypes', () => {
	afterEach( () => {
		delete window._wpMediaUploadPipelineSettings;
		delete window.wp;
	} );

	it( 'adds json to the pipeline mime map and restores it', () => {
		// Arrange.
		const allowedMimeTypes = { 'jpg|jpeg|jpe': 'image/jpeg' };
		window._wpMediaUploadPipelineSettings = { allowedMimeTypes };

		// Act.
		const restore = allowPipelineMimeTypes( [ 'json' ] );

		// Assert.
		expect( allowedMimeTypes.json ).toBe( 'application/json' );

		// Act.
		restore();

		// Assert.
		expect( allowedMimeTypes ).toEqual( { 'jpg|jpeg|jpe': 'image/jpeg' } );
	} );
} );
