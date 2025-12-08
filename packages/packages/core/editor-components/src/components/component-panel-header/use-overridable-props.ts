import { __useSelector as useSelector } from '@elementor/store';

import { type ComponentsSlice, selectOverridableProps } from '../../store/store';
import { type ComponentId, type OverridableProps } from '../../types';

export function useOverridableProps( componentId: ComponentId | null ): OverridableProps | undefined {
	return useSelector( ( state: ComponentsSlice ) => {
		if ( ! componentId ) {
			return undefined;
		}

		return selectOverridableProps( state, componentId );
	} );
}
