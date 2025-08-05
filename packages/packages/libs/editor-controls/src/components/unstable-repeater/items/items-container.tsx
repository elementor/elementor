import * as React from 'react';
import { type PropValue } from '@elementor/editor-props';

import { SortableItem, SortableProvider } from '../../sortable';
import { useRepeaterContext } from '../context/repeater-context';
import { type ItemProps } from '../types';

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
			<SortableProvider value={ uniqueKeys } onChange={ onChangeOrder }>
				{ uniqueKeys?.map( ( key: number, index: number ) => {
					const value = items?.[ index ] as T;

					if ( ! value ) {
						return null;
					}

					return (
						<SortableItem id={ key } key={ `sortable-${ key }` } disabled={ ! isSortable }>
							{ React.isValidElement< React.PropsWithChildren< ItemProps< T > > >( itemTemplate )
								? React.cloneElement( itemTemplate, {
										key,
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
