import { __useSelector as useSelector } from '@elementor/store';

import { selectOverridableProps } from '../../store/store';
import { type ComponentId, type OverridableProps } from '../../types';

export function useOverridableProps( componentId: ComponentId | null ): OverridableProps | undefined {
	return useSelector( ( state ) => {
		if ( ! componentId ) {
			return undefined;
		}

		return selectOverridableProps( state as Parameters< typeof selectOverridableProps >[ 0 ], componentId );
	} );
}
