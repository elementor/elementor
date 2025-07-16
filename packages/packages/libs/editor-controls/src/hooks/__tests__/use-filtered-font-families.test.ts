import { type Category } from '../../components/item-selector';
import { useFilteredItemsList } from '../use-filtered-items-list';

describe( 'useFilteredItemsList', () => {
	it( 'should return an array of filtered items by the search field', () => {
		// Arrange.
		const categories: Category[] = [
			{
				label: 'System',
				items: [ 'Font1', 'Font2' ],
			},
			{
				label: 'Google',
				items: [ 'Font3', 'Font4' ],
			},
		];

		const searchValue = '1';

		// Act.
		const result = useFilteredItemsList( categories, searchValue );

		// Assert.
		const expected = [
			{ type: 'category', value: 'System' },
			{ type: 'item', value: 'Font1' },
		];
		expect( result ).toStrictEqual( expected );
	} );
} );
