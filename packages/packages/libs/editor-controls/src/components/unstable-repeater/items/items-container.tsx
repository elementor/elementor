import * as React from 'react';

import { SortableItem, SortableProvider } from '../../sortable';
import { useRepeaterContext } from '../context/repeater-context';
import { type Item, type ItemProps, type RepeatablePropValue } from '../types';

export const ItemsContainer = < T extends RepeatablePropValue >( {
	itemTemplate,
	isSortable = true,
	children,
}: React.PropsWithChildren< { itemTemplate: React.ReactNode; isSortable?: boolean } > ) => {
	const { items, setItems, uniqueKeys, setUniqueKeys, openItem } = useRepeaterContext();

	if ( ! itemTemplate ) {
		return null;
	}

	const onChangeOrder = ( newKeys: number[] ) => {
		setUniqueKeys( newKeys );
		setItems( ( prevItems ) =>
			newKeys.map( ( key ) => {
				const index = uniqueKeys.indexOf( key );

				return prevItems[ index ] as Item< RepeatablePropValue >;
			} )
		);
	};

	return (
		<>
			<SortableProvider value={ uniqueKeys } onChange={ onChangeOrder }>
				{ uniqueKeys?.map( ( key: number, index: number ) => {
					const value = items?.[ index ] as Item< T >;

					if ( ! value ) {
						return null;
					}

					return (
						<SortableItem id={ key } key={ `sortable-${ key }` } disabled={ ! isSortable }>
							{ React.isValidElement< React.PropsWithChildren< ItemProps< T > > >( itemTemplate )
								? React.cloneElement( itemTemplate, {
										key: index,
										value,
										index,
										openOnMount: key === openItem,
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
