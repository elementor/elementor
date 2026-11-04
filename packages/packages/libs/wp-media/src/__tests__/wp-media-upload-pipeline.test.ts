import { allowPipelineMimeTypes } from '../wp-media-upload-pipeline';

type MimeMap = Record< string, string >;

describe( 'allowPipelineMimeTypes', () => {
	const store = {};

	afterEach( () => {
		delete window._wpMediaUploadPipelineSettings;
		delete window.wp;
	} );

	it( 'adds svg and json to the localized list and a separate upload-store list', () => {
		// Arrange.
		const localized: MimeMap = { 'jpg|jpeg|jpe': 'image/jpeg' };
		const storeMimeTypes: MimeMap = { 'jpg|jpeg|jpe': 'image/jpeg' };
		window._wpMediaUploadPipelineSettings = { allowedMimeTypes: localized };
		window.wp = {
			uploadMedia: { store },
			data: {
				select: () => ( {
					getSettings: () => ( { allowedMimeTypes: storeMimeTypes } ),
				} ),
			},
		};

		// Act.
		const restore = allowPipelineMimeTypes( [ 'svg', 'json', 'png' ] );

		// Assert.
		expect( localized ).toEqual( {
			'jpg|jpeg|jpe': 'image/jpeg',
			json: 'application/json',
			svg: 'image/svg+xml',
		} );
		expect( storeMimeTypes ).toEqual( localized );

		// Act.
		restore();

		// Assert.
		expect( localized ).toEqual( { 'jpg|jpeg|jpe': 'image/jpeg' } );
		expect( storeMimeTypes ).toEqual( { 'jpg|jpeg|jpe': 'image/jpeg' } );
	} );

	it( 'updates a shared mime map once', () => {
		// Arrange.
		const shared: MimeMap = { 'jpg|jpeg|jpe': 'image/jpeg' };
		window._wpMediaUploadPipelineSettings = { allowedMimeTypes: shared };
		window.wp = {
			uploadMedia: { store },
			data: {
				select: () => ( {
					getSettings: () => ( { allowedMimeTypes: shared } ),
				} ),
			},
		};

		// Act.
		const restore = allowPipelineMimeTypes( [ 'svg' ] );

		// Assert.
		expect( shared.svg ).toBe( 'image/svg+xml' );

		// Act.
		restore();

		// Assert.
		expect( shared ).toEqual( { 'jpg|jpeg|jpe': 'image/jpeg' } );
	} );

	it( 'does nothing when WordPress has no upload pipeline settings', () => {
		// Act.
		const restore = allowPipelineMimeTypes( [ 'svg' ] );

		// Assert.
		expect( window._wpMediaUploadPipelineSettings ).toBeUndefined();
		expect( () => restore() ).not.toThrow();
	} );
} );
