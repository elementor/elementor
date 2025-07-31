import * as React from 'react';
import { useMemo } from 'react';
import { type PropValue } from '@elementor/editor-props';

import { SlotChildren } from '../../../control-replacements';
import { SortableItem, SortableProvider } from '../../sortable';
import { DisableItemAction } from '../actions/disable-item-action';
import { DuplicateItemAction } from '../actions/duplicate-item-action';
import { RemoveItemAction } from '../actions/remove-item-action';
import { useRepeaterContext } from '../context/repeater-context';
import { type ItemProps } from '../types';
import { ItemActionSlot } from './item-action-slot';

export const ItemsContainer = < T extends PropValue >( {
	itemTemplate,
	isSortable = true,
	children,
}: React.PropsWithChildren< { itemTemplate: React.ReactNode; isSortable?: boolean } > ) => {
	const { items, setItems, openItem } = useRepeaterContext();
	const indexes = useMemo( () => items.map( ( _, index ) => index ), [ items ] );

	if ( ! itemTemplate ) {
		return null;
	}

	const onChangeOrder = ( newOrder: number[] ) => {
		setItems( ( prevItems ) =>
			newOrder.map( ( key ) => {
				const index = indexes.indexOf( key );

				return prevItems[ index ];
			} )
		);
	};

	return (
		<>
			<SlotChildren
				whitelist={ [ DuplicateItemAction, DisableItemAction, RemoveItemAction, ItemActionSlot ] }
				sorted
			>
				{ children }
			</SlotChildren>
			<SortableProvider value={ indexes } onChange={ onChangeOrder }>
				{ indexes?.map( ( key: number, index: number ) => {
					const value = items?.[ index ] as T;

					if ( ! value ) {
						return null;
					}

					return (
						<SortableItem id={ key } key={ `sortable-${ key }` } disabled={ ! isSortable }>
							{ React.isValidElement< ItemProps< T > >( itemTemplate )
								? React.cloneElement( itemTemplate, {
										key,
										value,
										index,
										openOnMount: key === openItem,
								  } )
								: null }
						</SortableItem>
					);
				} ) }
			</SortableProvider>
		</>
	);
};
