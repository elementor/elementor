import * as React from 'react';
import { type PropValue } from '@elementor/editor-props';

import { SortableItem, SortableProvider } from '../../sortable';
import { useRepeaterContext } from '../context/repeater-context';
import { type ItemProps } from '../types';

export const ItemsContainer = < T extends PropValue >( { children }: { children: React.ReactNode } ) => {
	return <ItemsList itemTemplate={ children } />;
};

type ItemsListProps = {
	itemTemplate?: React.ReactNode;
};

const ItemsList = < T extends PropValue >( { itemTemplate }: ItemsListProps ) => {
	const { items, setItems, uniqueKeys, setUniqueKeys, openItem, isSortable } = useRepeaterContext();

	if ( ! itemTemplate ) {
		return null;
	}

	const onChangeOrder = ( reorderedKeys: number[] ) => {
		setUniqueKeys( reorderedKeys );
		setItems( ( prevItems ) =>
			reorderedKeys.map( ( key ) => {
				const index = uniqueKeys.indexOf( key );

				return prevItems[ index ];
			} )
		);
	};

	return (
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
	);
};
