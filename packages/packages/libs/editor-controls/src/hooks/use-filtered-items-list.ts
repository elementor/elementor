import { type Category } from '../components/item-selector';

export type SelectableItem = {
	type: 'item' | 'category';
	value: string;
};

export const useFilteredItemsList = ( itemsList: Category[], searchValue: string ) => {
	return itemsList.reduce< SelectableItem[] >( ( acc, category ) => {
		const filteredItems = category.items.filter( ( item ) =>
			item.toLowerCase().includes( searchValue.toLowerCase() )
		);

		if ( filteredItems.length ) {
			acc.push( { type: 'category', value: category.label } );

			filteredItems.forEach( ( item ) => {
				acc.push( { type: 'item', value: item } );
			} );
		}

		return acc;
	}, [] );
};
