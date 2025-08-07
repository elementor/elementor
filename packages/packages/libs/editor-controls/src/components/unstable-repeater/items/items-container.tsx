import * as React from 'react';

import { SortableItem, SortableProvider } from '../../sortable';
import { useRepeaterContext } from '../context/repeater-context';
import { type Item, type ItemProps, type RepeatablePropValue } from '../types';

export const ItemsContainer = < T extends RepeatablePropValue >( {
	itemTemplate,
	isSortable = true,
	children,
}: React.PropsWithChildren< { itemTemplate: React.ReactNode; isSortable?: boolean } > ) => {
	const { items, setItems } = useRepeaterContext();
	const keys = items.map( ( { key } ) => key );

	if ( ! itemTemplate ) {
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
							{ React.isValidElement< React.PropsWithChildren< ItemProps< T > > >( itemTemplate )
								? React.cloneElement( itemTemplate, {
										key,
										value,
										index,
										children,
								  } )
								: null }
						</SortableItem>
					);
				} ) }
			</SortableProvider>
		</>
	);
};
