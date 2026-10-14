import { useEffect } from 'react';
import type { Virtualizer } from '@tanstack/react-virtual';

import type { VirtualizedItem } from '../components/popover/menu-list';

type UseScrollToSelectedProps< T, V extends string > = {
	selectedValue?: V;
	items: VirtualizedItem< T, V >[];
	virtualizer: Virtualizer< HTMLDivElement, Element >;
};

export const useScrollToSelected = < T, V extends string >( {
	selectedValue,
	items,
	virtualizer,
}: UseScrollToSelectedProps< T, V > ) => {
	useEffect( () => {
		if ( ! selectedValue || items.length === 0 ) {
			return;
		}

		const selectedIndex = items.findIndex( ( item ) => item.value === selectedValue );

		if ( selectedIndex !== -1 ) {
			virtualizer.scrollToIndex( selectedIndex, { align: 'center' } );
		}
	}, [ selectedValue, items, virtualizer ] );
};
