import { Schema } from '@elementor/editor-props';
import { getElementorConfig } from '@elementor/editor-v1-adapters';

import { DYNAMIC_TAGS_URI, initDynamicTagsResource } from '../dynamic-tags-resource';

jest.mock( '@elementor/editor-props', () => ( {
	Schema: {
		propTypeToJsonSchema: jest.fn( () => ( { mocked: true } ) ),
	},
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	getElementorConfig: jest.fn(),
} ) );

const mockedGetElementorConfig = getElementorConfig as jest.MockedFunction< typeof getElementorConfig >;

type ResourceHandler = ( uri: URL ) => Promise< { contents: { text: string }[] } >;

const captureHandler = (): ResourceHandler => {
	const resource = jest.fn();
	initDynamicTagsResource( { resource } as never );
	return resource.mock.calls[ 0 ][ 3 ] as ResourceHandler;
};

const readCatalog = async () => {
	const handler = captureHandler();
	const result = await handler( new URL( DYNAMIC_TAGS_URI ) );
	return JSON.parse( result.contents[ 0 ].text );
};

describe( 'dynamic-tags-resource', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns a flat tag list with categories and omits the fallback setting', async () => {
		// Arrange
		mockedGetElementorConfig.mockReturnValue( {
			atomicDynamicTags: {
				tags: {
					'post-custom-field': {
						name: 'post-custom-field',
						label: 'Post Custom Field',
						group: 'post',
						categories: [ 'text', 'url' ],
						props_schema: {
							key: { kind: 'string', key: 'string' },
							before: { kind: 'string', key: 'string' },
							fallback: { kind: 'string', key: 'string' },
						},
					},
				},
				groups: { post: { title: 'Post' } },
			},
		} as never );

		// Act
		const catalog = await readCatalog();

		// Assert
		expect( Array.isArray( catalog ) ).toBe( true );
		expect( catalog ).toHaveLength( 1 );
		expect( catalog[ 0 ] ).toMatchObject( {
			name: 'post-custom-field',
			label: 'Post Custom Field',
			categories: [ 'text', 'url' ],
		} );
		expect( catalog[ 0 ] ).not.toHaveProperty( 'group' );
		expect( Object.keys( catalog[ 0 ].settings ) ).toEqual( [ 'key', 'before' ] );
		expect( catalog[ 0 ].settings ).not.toHaveProperty( 'fallback' );
	} );

	it( 'returns an empty list when dynamic tags are unavailable', async () => {
		// Arrange
		mockedGetElementorConfig.mockReturnValue( {} as never );

		// Act
		const catalog = await readCatalog();

		// Assert
		expect( catalog ).toEqual( [] );
		expect( Schema.propTypeToJsonSchema ).not.toHaveBeenCalled();
	} );
} );
