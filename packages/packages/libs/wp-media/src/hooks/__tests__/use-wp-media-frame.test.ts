import { renderHook } from '@testing-library/react';

import media from '../../media';
import { type WpPluploadSettingsWindow } from '../../types/plupload';
import {
	type BackboneAttachmentModel,
	type CreateMediaFrameOptions,
	type MediaFrame,
	type WpAttachmentJSON,
} from '../../types/wp-media';
import useWpMediaFrame from '../use-wp-media-frame';

jest.mock( '../../media', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

describe( 'useWpMediaFrame', () => {
	beforeAll( () => {
		( window as unknown as WpPluploadSettingsWindow )._wpPluploadSettings = {
			defaults: {
				filters: {
					max_file_size: '314572800b',
					mime_types: [
						{
							// This is a mock of WordPress's plupload settings, the extensions are the real extensions WordPress allow to upload by default
							extensions:
								'jpg,jpeg,jpe,gif,png,bmp,tiff,tif,webp,avif,ico,heic,heif,heics,heifs,asf,asx,wmv,wmx,wm,avi,flv,mov,qt,mpeg,mpg,mpe,mp4,m4v,ogv,webm,mkv,3gp,3gpp,3g2,3gp2,txt,asc,c,cc,h,srt,csv,tsv,ics,rtx,css,htm,html,vtt,mp3,m4a,m4b,aac,ra,ram,wav,ogg,oga,mid,midi,wma,wax,mka,rtf,js,pdf,class,tar,zip,gz,gzip,rar,7z,psd,xcf,doc,pot,pps,ppt,wri,xla,xls,xlt,xlw,mdb,mpp,docx,docm,dotx,xlsx,xlsm,xltx,xltm,xlam,pptx,pptm,ppsx,ppsm,potx,potm,ppam,sldx,sldm,xps,odt,odp,ods,odg,odc,odb,odf,wp,wpd,key,numbers,pages',
						},
					],
				},
			},
		};
	} );

	it( 'should open a media frame with options', () => {
		// Arrange.
		const mockMedia = createMedia( {
			1: createModel( { id: 1 } ),
			2: createModel( { id: 2 } ),
		} );

		jest.mocked( media ).mockReturnValue( mockMedia );

		const { result } = renderHook( () =>
			useWpMediaFrame( {
				selected: 1,
				title: 'test title',
				multiple: false,
				mediaTypes: [ 'image' ],
				onSelect: () => {},
			} )
		);

		// Act.
		result.current.open();

		const frame = mockMedia.currentFrame as MockFrame;

		// Assert.
		expect( frame.open ).toHaveBeenCalled();
		expect( frame.title ).toBe( 'test title' );
		expect( frame.multiple ).toBe( false );
		expect( frame.mode ).toBe( 'browse' );
		expect( frame.selection.length ).toBe( 1 );
		expect( frame.selection[ 0 ].toJSON().id ).toBe( 1 );
		expect( frame.library?.type ).toEqual( [
			'image/avif',
			'image/bmp',
			'image/gif',
			'image/ico',
			'image/jpe',
			'image/jpeg',
			'image/jpg',
			'image/png',
			'image/webp',
		] );
	} );

	it( 'should trigger onSelect', () => {
		// Arrange.
		const mockMedia = createMedia( {
			1: createModel( { id: 1 } ),
			2: createModel( { id: 2 } ),
		} );

		jest.mocked( media ).mockReturnValue( mockMedia );

		const onSelect = jest.fn();

		const { result } = renderHook( () =>
			useWpMediaFrame( {
				selected: 1,
				title: 'test title',
				multiple: false,
				mediaTypes: [ 'image' ],
				onSelect,
			} )
		);

		result.current.open();

		const frame = mockMedia.currentFrame as MockFrame;

		// Act.
		frame.trigger( 'select' );

		// Assert.
		expect( onSelect ).toHaveBeenCalledTimes( 1 );
		expect( onSelect ).toHaveBeenNthCalledWith( 1, expect.objectContaining( { id: 1 } ) );

		// Act.
		frame.trigger( 'insert' );

		// Assert.
		expect( onSelect ).toHaveBeenCalledTimes( 2 );
		expect( onSelect ).toHaveBeenNthCalledWith( 2, expect.objectContaining( { id: 1 } ) );
	} );

	it( 'should support multi select', () => {
		// Arrange.
		const mockMedia = createMedia( {
			1: createModel( { id: 1 } ),
			2: createModel( { id: 2 } ),
		} );

		jest.mocked( media ).mockReturnValue( mockMedia );

		const onSelect = jest.fn();

		const { result } = renderHook( () =>
			useWpMediaFrame( {
				selected: [ 1, 2 ],
				multiple: true,
				mediaTypes: [ 'image' ],
				onSelect,
			} )
		);

		// Act.
		result.current.open();

		const frame = mockMedia.currentFrame as MockFrame;

		// Assert.
		expect( frame.multiple ).toBe( true );
		expect( frame.selection.length ).toBe( 2 );
		expect( frame.selection[ 0 ].toJSON().id ).toBe( 1 );
		expect( frame.selection[ 1 ].toJSON().id ).toBe( 2 );

		// Act.
		frame.trigger( 'select' );

		// Assert.
		expect( onSelect ).toHaveBeenCalledWith( [
			expect.objectContaining( { id: 1 } ),
			expect.objectContaining( { id: 2 } ),
		] );
	} );

	it( 'should support upload mode', () => {
		// Arrange.
		const mockMedia = createMedia( {} );

		jest.mocked( media ).mockReturnValue( mockMedia );

		const { result } = renderHook( () =>
			useWpMediaFrame( {
				selected: null,
				multiple: false,
				mediaTypes: [ 'image' ],
				onSelect: () => {},
			} )
		);

		// Act.
		result.current.open( { mode: 'upload' } );

		const frame = mockMedia.currentFrame as MockFrame;

		// Assert.
		expect( frame.mode ).toBe( 'upload' );
	} );

	it( 'should cleanup on re-open', () => {
		// Arrange.
		const mockMedia = createMedia( {} );

		jest.mocked( media ).mockReturnValue( mockMedia );

		const { result } = renderHook( () =>
			useWpMediaFrame( {
				selected: null,
				multiple: false,
				mediaTypes: [ 'image' ],
				onSelect: () => {},
			} )
		);

		// Act.
		result.current.open();

		const frame = mockMedia.currentFrame as MockFrame;

		// Assert.
		expect( frame.detach ).not.toHaveBeenCalled();
		expect( frame.remove ).not.toHaveBeenCalled();

		// Act - re-open.
		result.current.open();

		// Assert.
		expect( frame.detach ).toHaveBeenCalled();
		expect( frame.remove ).toHaveBeenCalled();
	} );

	it( 'should cleanup on unmount', () => {
		// Arrange.
		const mockMedia = createMedia( {} );

		jest.mocked( media ).mockReturnValue( mockMedia );

		const { result, unmount } = renderHook( () =>
			useWpMediaFrame( {
				selected: null,
				multiple: false,
				mediaTypes: [ 'image' ],
				onSelect: () => {},
			} )
		);

		// Act.
		result.current.open();

		const frame = mockMedia.currentFrame as MockFrame;

		unmount();

		// Assert.
		expect( frame.detach ).toHaveBeenCalled();
		expect( frame.remove ).toHaveBeenCalled();
	} );

	it( 'should cleanup on close', () => {
		// Arrange.
		const mockMedia = createMedia( {} );

		jest.mocked( media ).mockReturnValue( mockMedia );

		const { result } = renderHook( () =>
			useWpMediaFrame( {
				selected: null,
				multiple: false,
				mediaTypes: [ 'image' ],
				onSelect: () => {},
			} )
		);

		// Act.
		result.current.open();

		const frame = mockMedia.currentFrame as MockFrame;

		frame.trigger( 'close' );

		// Assert.
		expect( frame.detach ).toHaveBeenCalled();
		expect( frame.remove ).toHaveBeenCalled();
	} );
} );

type Event = 'open' | 'close' | 'select' | 'insert';
type MockFrame = MediaFrame & {
	trigger: ( event: Event ) => void;
	events: { [ k in Event ]?: ( () => void )[] };
	mode: string | null;
	selection: BackboneAttachmentModel[];
	title: string;
	multiple: boolean;
	library?: {
		type?: string[] | string;
	};
};

function createMedia( attachments: Record< number, BackboneAttachmentModel > ) {
	const mockMedia = ( options: CreateMediaFrameOptions ) => {
		const frame: MockFrame = {
			mode: null,
			title: options.title ?? '',
			multiple: options.multiple ?? false,
			library: options.library ?? undefined,
			uploader: {
				uploader: {
					param: jest.fn(),
				},
			},
			events: {},
			selection: [],

			open: jest.fn( () => frame.trigger( 'open' ) ),
			detach: jest.fn(),
			remove: jest.fn(),

			content: {
				mode: ( newMode ) => {
					frame.mode = newMode;
				},
			},

			trigger: ( event ) => frame.events[ event ]?.forEach( ( cb ) => cb() ),

			on( event, callback ) {
				event
					.trim()
					.split( ' ' )
					.forEach( ( e ) => {
						const eventCbs = this.events[ e as Event ];
						if ( eventCbs ) {
							eventCbs.push( callback );
						} else {
							this.events[ e as Event ] = [ callback ];
						}
					} );

				return this;
			},

			state: () => ( {
				get: ( key ) => {
					if ( key !== 'selection' ) {
						return null as never;
					}

					return {
						set: ( selections ) => {
							frame.selection = selections;
						},

						toJSON: () =>
							frame.selection.map( ( attachment ) => {
								return attachment.toJSON() as WpAttachmentJSON;
							} ),
					};
				},
			} ),
		};

		mockMedia.currentFrame = frame;

		return frame;
	};

	mockMedia.attachment = ( id: number ) => {
		return attachments[ id ] ?? null;
	};

	mockMedia.currentFrame = null as MockFrame | null;

	return mockMedia;
}

function createModel( attachment: Partial< WpAttachmentJSON > ): BackboneAttachmentModel {
	return {
		toJSON() {
			return attachment as WpAttachmentJSON;
		},
		fetch() {
			return Promise.resolve( attachment as WpAttachmentJSON );
		},
	};
}
