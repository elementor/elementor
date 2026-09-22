import {
	getIconLibraryFilterItems,
	getSelectableFilterValues,
	ICON_LIBRARY_FILTER_TYPE_ALL,
	ICON_LIBRARY_FILTER_TYPE_GROUP,
	ICON_LIBRARY_FILTER_TYPE_ITEM,
} from '../icon-library-filter-items';

describe( 'icon-library-filter-items', () => {
	const originalElementorCommon = window.elementorCommon;

	afterEach( () => {
		window.elementorCommon = originalElementorCommon;
	} );

	it( 'falls back to font awesome entries when the backend filter is missing', () => {
		// Arrange.
		window.elementorCommon = { config: {} } as typeof window.elementorCommon;

		// Act.
		const entries = getIconLibraryFilterItems();

		// Assert.
		expect( entries.map( ( entry ) => entry.type ) ).toEqual( [
			ICON_LIBRARY_FILTER_TYPE_ALL,
			ICON_LIBRARY_FILTER_TYPE_ITEM,
			ICON_LIBRARY_FILTER_TYPE_ITEM,
			ICON_LIBRARY_FILTER_TYPE_ITEM,
		] );
		expect( getSelectableFilterValues( entries ) ).toEqual( [ 'fa-regular', 'fa-solid', 'fa-brands' ] );
	} );

	it( 'renders backend filter entries including a group title', () => {
		// Arrange.
		window.elementorCommon = {
			config: {
				fontAwesome: {
					v7: {
						jsonFiles: [ 'solid' ],
						jsonBaseUrl: 'https://example.com/',
						filter: [
							{ type: 'all', label: 'All icons', icon: 'list' },
							{ type: 'item', value: 'fa-solid', label: 'Font Awesome - Solid', icon: 'star-filled' },
							{ type: 'group', label: 'My libraries' },
							{ type: 'item', value: 'nehama-1', label: 'Nehama 1', icon: 'library' },
							{ type: 'unknown', label: 'skip me' },
						],
					},
				},
			},
		} as typeof window.elementorCommon;

		// Act.
		const entries = getIconLibraryFilterItems();

		// Assert.
		expect( entries ).toEqual( [
			{ type: ICON_LIBRARY_FILTER_TYPE_ALL, label: 'All icons', icon: 'list' },
			{
				type: ICON_LIBRARY_FILTER_TYPE_ITEM,
				value: 'fa-solid',
				label: 'Font Awesome - Solid',
				icon: 'star-filled',
			},
			{ type: ICON_LIBRARY_FILTER_TYPE_GROUP, label: 'My libraries' },
			{ type: ICON_LIBRARY_FILTER_TYPE_ITEM, value: 'nehama-1', label: 'Nehama 1', icon: 'library' },
		] );
		expect( getSelectableFilterValues( entries ) ).toEqual( [ 'fa-solid', 'nehama-1' ] );
	} );
} );
