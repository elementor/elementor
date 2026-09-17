import { getElementorConfig } from '@elementor/editor-v1-adapters';

import { dynamicTagLLMResolver, getDynamicTagNamesByCategories } from '../resolve-dynamic-tag';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	getElementorConfig: jest.fn(),
} ) );

const mockedGetElementorConfig = getElementorConfig as jest.MockedFunction< typeof getElementorConfig >;

const givenTags = () =>
	mockedGetElementorConfig.mockReturnValue( {
		atomicDynamicTags: {
			tags: {
				'post-custom-field': {
					name: 'post-custom-field',
					label: 'Post Custom Field',
					group: 'post',
					categories: [ 'text', 'url' ],
					props_schema: {
						key: { kind: 'plain', key: 'string', default: '' },
						before: { kind: 'plain', key: 'string', default: 'prefix' },
						fallback: { kind: 'plain', key: 'string', default: '' },
					},
				},
				'site-title': {
					name: 'site-title',
					label: 'Site Title',
					group: 'site',
					categories: [ 'text' ],
					props_schema: {},
				},
			},
		},
	} as never );

describe( 'resolve-dynamic-tag', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		givenTags();
	} );

	describe( 'getDynamicTagNamesByCategories', () => {
		it( 'returns only the tags whose categories intersect the prop categories', () => {
			// Act
			const names = getDynamicTagNamesByCategories( [ 'url' ] );

			// Assert
			expect( names ).toEqual( [ 'post-custom-field' ] );
		} );

		it( 'returns an empty list when no categories are requested', () => {
			// Act & Assert
			expect( getDynamicTagNamesByCategories( [] ) ).toEqual( [] );
		} );
	} );

	describe( 'dynamicTagLLMResolver', () => {
		it( 'fills the group from the registry and wraps provided scalar settings', () => {
			// Act
			const resolved = dynamicTagLLMResolver( {
				name: 'post-custom-field',
				settings: { key: 'price' },
			} );

			// Assert
			expect( resolved ).toEqual( {
				$$type: 'dynamic',
				value: {
					name: 'post-custom-field',
					group: 'post',
					settings: {
						key: { $$type: 'string', value: 'price' },
						before: { $$type: 'string', value: 'prefix' },
					},
				},
			} );
		} );

		it( 'keeps already-wrapped settings values untouched', () => {
			// Act
			const resolved = dynamicTagLLMResolver( {
				name: 'post-custom-field',
				settings: { key: { $$type: 'string', value: 'price' } },
			} ) as { value: { settings: Record< string, unknown > } };

			// Assert
			expect( resolved.value.settings.key ).toEqual( { $$type: 'string', value: 'price' } );
		} );

		it( 'returns a structurally complete value for unknown tags', () => {
			// Act
			const resolved = dynamicTagLLMResolver( { name: 'does-not-exist' } );

			// Assert
			expect( resolved ).toEqual( {
				$$type: 'dynamic',
				value: { name: 'does-not-exist', group: '', settings: {} },
			} );
		} );
	} );
} );
