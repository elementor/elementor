import * as React from 'react';
import { type PropValue } from '@elementor/editor-props';
import { Box } from '@elementor/ui';

import { SortableItem, SortableProvider } from '../../sortable';
import { useRepeaterContext } from '../context/repeater-context';
import { type ItemProps } from '../types';

export const ItemsContainer = < T extends PropValue >( {
	itemTemplate,
	children,
	setTransformOriginPopoverAnchorRef,
}: React.PropsWithChildren< {
	itemTemplate: React.ReactNode;
	setTransformOriginPopoverAnchorRef?: ( ref?: HTMLDivElement ) => void;
} > ) => {
	const { items, uniqueKeys, openItem, isSortable, sortItemsByKeys } = useRepeaterContext();

	if ( ! itemTemplate ) {
		return null;
	}

	const onChangeOrder = ( newOrder: number[] ) => {
		sortItemsByKeys( newOrder );
	};

	return (
		<Box
			sx={ { width: '100%', height: '100%', p: 0, m: 0 } }
			ref={ ( ref?: HTMLDivElement ) => setTransformOriginPopoverAnchorRef?.( ref ) }
		>
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
		</Box>
	);
};
