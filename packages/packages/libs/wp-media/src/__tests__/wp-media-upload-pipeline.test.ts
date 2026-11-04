import { allowPipelineMimeTypes } from '../wp-media-upload-pipeline';

type MimeMap = Record< string, string >;

type PipelineWindow = Window & {
	_wpMediaUploadPipelineSettings?: {
		allowedMimeTypes?: MimeMap;
	};
	wp?: {
		data?: {
			select: ( store: object ) => {
				getSettings?: () => {
					allowedMimeTypes?: MimeMap;
				};
			};
		};
		uploadMedia?: {
			store?: object;
		};
	};
};

const pipelineWindow = window as PipelineWindow;

describe( 'allowPipelineMimeTypes', () => {
	const store = {};

	afterEach( () => {
		delete pipelineWindow._wpMediaUploadPipelineSettings;
		delete pipelineWindow.wp;
	} );

	it( 'adds svg and json to the localized list and a separate upload-store list', () => {
		// Arrange.
		const localized: MimeMap = { 'jpg|jpeg|jpe': 'image/jpeg' };
		const storeMimeTypes: MimeMap = { 'jpg|jpeg|jpe': 'image/jpeg' };
		pipelineWindow._wpMediaUploadPipelineSettings = { allowedMimeTypes: localized };
		pipelineWindow.wp = {
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
		pipelineWindow._wpMediaUploadPipelineSettings = { allowedMimeTypes: shared };
		pipelineWindow.wp = {
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
		expect( pipelineWindow._wpMediaUploadPipelineSettings ).toBeUndefined();
		expect( () => restore() ).not.toThrow();
	} );
} );
