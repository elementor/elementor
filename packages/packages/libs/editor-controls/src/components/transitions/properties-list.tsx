import * as React from 'react';
import { useMemo } from 'react';
import { PopoverMenuList } from '@elementor/editor-ui';

import { type TransitionListItem } from '../../hooks/use-filtered-transition-properties';

type TransitionPropertyListProps = {
	items: TransitionListItem[];
	setProperty: ( property: string ) => void;
	handleClose: () => void;
	selectedProperty: string | null;
};

export const TransitionPropertyList = ( {
	items,
	setProperty,
	handleClose,
	selectedProperty,
}: TransitionPropertyListProps ) => {
	const selectedItem = useMemo( () => {
		return items.find( ( item ) => item.value === selectedProperty && item.type === 'property' );
	}, [ items, selectedProperty ] );

	return (
		<PopoverMenuList
			items={ items }
			selectedValue={ selectedItem?.value }
			onSelect={ ( value ) => {
				const item = items.find( ( i ) => i.value === value );
				if ( item && item.type === 'property' ) {
					setProperty( value );
				}
			} }
			onClose={ handleClose }
			itemStyle={ ( item ) => ( {
				fontWeight: item.type === 'category' ? 'bold' : 'normal',
				color: item.type === 'category' ? 'text.primary' : 'text.secondary',
			} ) }
			data-testid="transition-property-list"
		/>
	);
};
