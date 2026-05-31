import {
	buildDynamicTagsByCategoryPayload,
	buildDynamicTagsResourcePayload,
	listDynamicTagCategories,
} from '../build-dynamic-tags-resource-payload';

describe( 'buildDynamicTagsResourcePayload', () => {
	const atomicDynamicTags = {
		groups: {
			core: { title: 'Core' },
			pro: { title: 'Pro' },
		},
		tags: {
			'post-title': {
				name: 'post-title',
				label: 'Post Title',
				group: 'core',
				categories: [ 'text' ],
			},
			'post-url': {
				name: 'post-url',
				label: 'Post URL',
				group: 'core',
				categories: [ 'url', 'text' ],
			},
		},
	};

	it( 'should return empty payload when config is missing', () => {
		// Arrange.
		const config = null;

		// Act.
		const payload = buildDynamicTagsResourcePayload( config );

		// Assert.
		expect( payload ).toEqual( {
			groups: {},
			tags: {},
			by_category: {},
		} );
	} );

	it( 'should build catalog with tags indexed by category', () => {
		// Arrange.
		const config = atomicDynamicTags;

		// Act.
		const payload = buildDynamicTagsResourcePayload( config );

		// Assert.
		expect( payload.groups ).toEqual( atomicDynamicTags.groups );
		expect( payload.tags[ 'post-title' ] ).toEqual( {
			name: 'post-title',
			label: 'Post Title',
			group: 'core',
			categories: [ 'text' ],
		} );
		expect( payload.by_category.text ).toEqual( [ 'post-title', 'post-url' ] );
		expect( payload.by_category.url ).toEqual( [ 'post-url' ] );
	} );

	it( 'should filter tags by category', () => {
		// Arrange.
		const config = atomicDynamicTags;

		// Act.
		const payload = buildDynamicTagsByCategoryPayload( config, 'url' );

		// Assert.
		expect( payload.category ).toBe( 'url' );
		expect( payload.tag_names ).toEqual( [ 'post-url' ] );
		expect( payload.tags ).toEqual( {
			'post-url': {
				name: 'post-url',
				label: 'Post URL',
				group: 'core',
				categories: [ 'url', 'text' ],
			},
		} );
	} );

	it( 'should list sorted categories', () => {
		// Arrange.
		const config = atomicDynamicTags;

		// Act.
		const categories = listDynamicTagCategories( config );

		// Assert.
		expect( categories ).toEqual( [ 'text', 'url' ] );
	} );
} );
