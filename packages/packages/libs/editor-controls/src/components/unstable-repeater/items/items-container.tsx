import * as React from 'react';

import { SlotChildren } from '../../../control-replacements';
import { SortableItem, SortableProvider } from '../../sortable';
import { DisableItemAction } from '../actions/disable-item-action';
import { DuplicateItemAction } from '../actions/duplicate-item-action';
import { RemoveItemAction } from '../actions/remove-item-action';
import { useRepeaterContext } from '../context/repeater-context';
import { type Item, type ItemProps, type RepeatablePropValue } from '../types';

export const ItemsContainer = ( {
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
			<SlotChildren whitelist={ [ DuplicateItemAction, DisableItemAction, RemoveItemAction ] } sorted>
				{ children }
			</SlotChildren>
			<SortableProvider value={ uniqueKeys } onChange={ onChangeOrder }>
				{ uniqueKeys?.map( ( key: number, index: number ) => {
					const value = items?.[ index ] as Item< RepeatablePropValue >;

					if ( ! value ) {
						return null;
					}

					return (
						<SortableItem id={ key } key={ `sortable-${ key }` } disabled={ ! isSortable }>
							{ React.isValidElement< ItemProps< Item< RepeatablePropValue > > >( itemTemplate )
								? React.cloneElement( itemTemplate, {
										key: index,
										value,
										index,
										openOnMount: index === openItem,
								  } )
								: null }
						</SortableItem>
					);
				} ) }
			</SortableProvider>
		</>
	);
};
