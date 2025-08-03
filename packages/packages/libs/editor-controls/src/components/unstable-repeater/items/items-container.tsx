import * as React from 'react';
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
	children,
}: React.PropsWithChildren< { itemTemplate: React.ReactNode } > ) => {
	const { items, uniqueKeys, openItem, isSortable, sortItemsByKeys } = useRepeaterContext();

	if ( ! itemTemplate ) {
		return null;
	}

	const onChangeOrder = ( newOrder: number[] ) => {
		sortItemsByKeys( newOrder );
	};

	return (
		<>
			<SlotChildren
				whitelist={ [ DuplicateItemAction, DisableItemAction, RemoveItemAction, ItemActionSlot ] }
				sorted
			>
				{ children }
			</SlotChildren>
			<SortableProvider value={ uniqueKeys } onChange={ onChangeOrder }>
				{ uniqueKeys?.map( ( key: number, index: number ) => {
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
