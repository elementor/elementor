import * as React from 'react';

import { SortableItem, SortableProvider } from '../../repeater/sortable';
import { ItemContext } from '../context/item-context';
import { useRepeaterContext } from '../context/repeater-context';
import { type Item, type RepeatablePropValue } from '../types';

export const ItemsContainer = < T extends RepeatablePropValue >( {
	isSortable = true,
	children,
}: React.PropsWithChildren< {
	isSortable?: boolean;
} > ) => {
	const { items, setItems } = useRepeaterContext();
	const keys = items.map( ( { key } ) => key );

	if ( ! children ) {
		return null;
	}

	const onChangeOrder = ( newKeys: number[] ) => {
		setItems(
			newKeys.map( ( key ) => {
				const index = items.findIndex( ( item ) => item.key === key );

				return items[ index ];
			} )
		);
	};

	return (
		<>
			<SortableProvider value={ keys } onChange={ onChangeOrder }>
				{ keys.map( ( key: number, index: number ) => {
					const value = items[ index ].item as Item< T >;

					return (
						<SortableItem id={ key } key={ `sortable-${ key }` } disabled={ ! isSortable }>
							<ItemContext.Provider value={ { index, value } }>{ children }</ItemContext.Provider>
						</SortableItem>
					);
				} ) }
			</SortableProvider>
		</>
	);
};
