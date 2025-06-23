import { type FontCategory } from '@elementor/editor-controls';

import { useFilteredFontFamilies } from '../use-filtered-font-families';

describe( 'useFilteredFontFamilies', () => {
	it( 'should return an array of all font families by the search field', () => {
		// Arrange.
		const fonts: FontCategory[] = [
			{
				label: 'System',
				fonts: [ 'Font1', 'Font2' ],
			},
			{
				label: 'Google',
				fonts: [ 'Font3', 'Font4' ],
			},
		];

		const searchValue = '1';

		// Act.
		const result = useFilteredFontFamilies( fonts, searchValue );

		// Assert.
		const expected = [
			{ type: 'category', value: 'System' },
			{ type: 'font', value: 'Font1' },
		];
		expect( result ).toStrictEqual( expected );
	} );
} );
