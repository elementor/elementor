import { type PropType } from '@elementor/editor-props';

import { dynamicTransformer } from '../dynamic-transformer';
import { DynamicTagsManagerNotFoundError } from '../errors';
import { type DynamicTagsManager, type TagInstance } from '../types';

jest.mock( '@elementor/editor-v1-adapters', () => {
	const actual = jest.requireActual( '@elementor/editor-v1-adapters' );
	return {
		...actual,
		getElementorConfig: jest.fn(),
	};
} );

describe( 'dynamicTransformer', () => {
	const ELEMENTOR_MOCK = {
		dynamicTags: mockDynamicTagsManager(),
		config: {
			atomicDynamicTags: {
				tags: {
					'test-tag': {
						name: 'test-tag',
						label: 'Test Tag',
						group: 'Test Group',
						categories: [ 'Test Category' ],
						atomic_controls: [],
						props_schema: {},
					},
				},
				groups: {
					'Test Group': {
						title: 'Test Group',
					},
				},
			},
		},
	};

	beforeEach( () => {
		const { getElementorConfig } = require( '@elementor/editor-v1-adapters' );
		getElementorConfig.mockImplementation( () => ELEMENTOR_MOCK.config );
	} );

	afterEach( () => {
		delete window.elementor;
	} );
	it( 'should return null when there is no name', () => {
		// Act.
		const result = dynamicTransformer( {}, { key: 'test' } );

		// Assert.
		expect( result ).toBeNull();
	} );

	it( 'should throw when the dynamic tags manager cannot be found', () => {
		// Arrange.
		window.elementor = {
			...ELEMENTOR_MOCK,
			dynamicTags: undefined,
		};

		// Act & Assert.
		expect( () => {
			dynamicTransformer( { name: 'test-tag', settings: {} }, { key: 'test' } );
		} ).toThrow( DynamicTagsManagerNotFoundError );
	} );

	it( 'should fetch the tag value from server, and load from cache on next requests', async () => {
		// Arrange.
		window.elementor = ELEMENTOR_MOCK;

		// Act.
		const valueFromServer = dynamicTransformer(
			{ name: 'test-tag', settings: { settingKey: 'setting-value' } },
			{ key: 'test' }
		);

		// Assert.
		await expect( valueFromServer ).resolves.toBe( 'test-tag-{"settingKey":"setting-value"}' );

		// Act.
		const valueFromCache = dynamicTransformer(
			{ name: 'test-tag', settings: { settingKey: 'setting-value' } },
			{ key: 'test' }
		);

		// Assert.
		expect( valueFromCache ).toBe( 'test-tag-{"settingKey":"setting-value"}' );
	} );

	it( "should return null when tag doesn't exist", async () => {
		// Arrange.
		const { getElementorConfig } = require( '@elementor/editor-v1-adapters' );
		getElementorConfig.mockImplementation( () => ( {
			atomicDynamicTags: {
				tags: {},
				groups: {},
			},
		} ) );

		// Act.
		const value = dynamicTransformer(
			{ name: 'test-tag', settings: { settingKey: 'setting-value' } },
			{ key: 'test' }
		);

		// Assert.
		expect( value ).toBe( null );
	} );

	it( "should return default value if it exists when tag doesn't exist", async () => {
		// Arrange.
		const { getElementorConfig } = require( '@elementor/editor-v1-adapters' );
		getElementorConfig.mockImplementation( () => ( {
			atomicDynamicTags: {
				tags: {},
				groups: {},
			},
		} ) );

		// Act.
		const value = dynamicTransformer(
			{ name: 'test-tag', settings: { settingKey: 'setting-value' } },
			{ key: 'test', propType: { default: 'default-value' } as PropType }
		);

		// Assert.
		expect( value ).toBe( 'default-value' );
	} );

	it( 'should return default value for null dynamic values', async () => {
		// Arrange & Act.
		const value = dynamicTransformer( null as never, {
			key: 'test',
			propType: { default: 'default-value' } as PropType,
		} );

		// Assert.
		expect( value ).toBe( 'default-value' );
	} );
} );

function mockDynamicTagsManager(): DynamicTagsManager {
	const tags: Record< string, TagInstance > = {};
	const cache: Record< string, unknown > = {};

	return {
		createTag: ( id, name, settings ) => {
			tags[ name ] = {
				options: {
					id,
					name,
				},
				model: {
					toJSON: () => settings,
				},
			};

			return tags[ name ];
		},

		loadTagDataFromCache: ( tag ) => {
			const name = tag.options.name;
			const settings = tag.model.toJSON();

			const cacheKey = `${ name }-${ JSON.stringify( settings ) }`;

			if ( cache[ cacheKey ] ) {
				return cache[ cacheKey ];
			}

			// Populate for next "fetch".
			cache[ cacheKey ] = cacheKey;

			return null;
		},

		refreshCacheFromServer: ( callback ) => {
			callback();
		},
	};
}
