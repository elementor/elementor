import { type ExtendedWindow } from '../../sync/types';
import { dynamicTransformer } from '../dynamic-transformer';
import { DynamicTagsManagerNotFoundError } from '../errors';
import { type DynamicTagsManager, type TagInstance } from '../types';

jest.mock( '@elementor/editor-v1-adapters' );

describe( 'dynamicTransformer', () => {
	const extendedWindow = window as ExtendedWindow;
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
	it( 'should return null when there is no name', () => {
		// Act.
		const result = dynamicTransformer( {}, { key: 'test' } );

		// Assert.
		expect( result ).toBeNull();
	} );

	it( 'should throw when the dynamic tags manager cannot be found', () => {
		// Arrange.
		extendedWindow.elementor = {
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
		extendedWindow.elementor = ELEMENTOR_MOCK;

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
		// Arrange & Act.
		const value = dynamicTransformer(
			{ name: 'test-tag', settings: { settingKey: 'setting-value' } },
			{ key: 'test' }
		);

		// Assert.
		expect( value ).toBe( null );
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
