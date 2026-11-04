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
		expect( window.wp ).toBeUndefined();
		expect( () => restore() ).not.toThrow();
	} );

	it( 'lets the WordPress 7.2 client accept svg and json without dropping jpeg', () => {
		// Arrange.
		const allowedMimeTypes: MimeMap = { 'jpg|jpeg|jpe': 'image/jpeg' };
		window._wpMediaUploadPipelineSettings = { allowedMimeTypes };

		expect( isAllowedByUploadPipeline( 'image/svg+xml', allowedMimeTypes ) ).toBe( false );
		expect( isAllowedByUploadPipeline( 'application/json', allowedMimeTypes ) ).toBe( false );
		expect( isAllowedByUploadPipeline( 'image/jpeg', allowedMimeTypes ) ).toBe( true );

		// Act.
		const restore = allowPipelineMimeTypes( [ 'svg', 'json' ] );

		// Assert.
		expect( isAllowedByUploadPipeline( 'image/svg+xml', allowedMimeTypes ) ).toBe( true );
		expect( isAllowedByUploadPipeline( 'application/json', allowedMimeTypes ) ).toBe( true );
		expect( isAllowedByUploadPipeline( 'image/jpeg', allowedMimeTypes ) ).toBe( true );

		// Act.
		restore();

		// Assert.
		expect( isAllowedByUploadPipeline( 'image/svg+xml', allowedMimeTypes ) ).toBe( false );
		expect( isAllowedByUploadPipeline( 'image/jpeg', allowedMimeTypes ) ).toBe( true );
	} );

	it( 'keeps an svg entry WordPress already allowed', () => {
		// Arrange.
		const allowedMimeTypes: MimeMap = {
			'jpg|jpeg|jpe': 'image/jpeg',
			svg: 'image/svg+xml',
		};
		window._wpMediaUploadPipelineSettings = { allowedMimeTypes };

		// Act.
		const restore = allowPipelineMimeTypes( [ 'svg' ] );
		restore();

		// Assert.
		expect( allowedMimeTypes.svg ).toBe( 'image/svg+xml' );
		expect( isAllowedByUploadPipeline( 'image/jpeg', allowedMimeTypes ) ).toBe( true );
	} );

	it( 'ignores an upload store that is not registered yet', () => {
		// Arrange.
		const allowedMimeTypes: MimeMap = { 'jpg|jpeg|jpe': 'image/jpeg' };
		window._wpMediaUploadPipelineSettings = { allowedMimeTypes };
		window.wp = {
			uploadMedia: { store },
			data: {
				select: () => {
					throw new Error( 'Store "core/upload-media" is not registered' );
				},
			},
		};

		// Act.
		const restore = allowPipelineMimeTypes( [ 'svg' ] );

		// Assert.
		expect( allowedMimeTypes.svg ).toBe( 'image/svg+xml' );
		expect( isAllowedByUploadPipeline( 'image/jpeg', allowedMimeTypes ) ).toBe( true );

		// Act.
		restore();

		// Assert.
		expect( allowedMimeTypes ).toEqual( { 'jpg|jpeg|jpe': 'image/jpeg' } );
	} );
} );

function isAllowedByUploadPipeline( fileType: string, mimeMap?: MimeMap | null ) {
	const allowedMimeTypes = getMimeTypesArray( mimeMap );

	if ( ! allowedMimeTypes ) {
		return true;
	}

	return ! fileType || allowedMimeTypes.includes( fileType );
}

function getMimeTypesArray( mimeMap?: MimeMap | null ) {
	if ( ! mimeMap ) {
		return null;
	}

	return Object.entries( mimeMap ).flatMap( ( [ extensionsString, mime ] ) => {
		const [ type ] = mime.split( '/' );
		const extensions = extensionsString.split( '|' );

		return [ mime, ...extensions.map( ( extension ) => `${ type }/${ extension }` ) ];
	} );
}
