import { __useSelector as useSelector } from '@elementor/store';

import { type ComponentsSlice, useOverridableProps } from '../store/store';
import { type ComponentId, type OverridableProps } from '../types';
import { filterValidOverridableProps } from '../utils/filter-valid-overridable-props';

export function useValidOverridableProps( componentId: ComponentId | null ): OverridableProps | undefined {
	const overridableProps = useOverridableProps( componentId );

	const allComponents = useSelector( ( state: ComponentsSlice ) => state.components.data );

	if ( ! overridableProps ) {
		return undefined;
	}

	const getOverridablePropsForComponent = ( id: number ) => {
		const component = allComponents.find( ( c ) => c.id === id );
		return component?.overridableProps;
	};

	return filterValidOverridableProps( overridableProps, getOverridablePropsForComponent );
}
