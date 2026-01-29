import { useOverridableProps } from '../store/store';
import { type ComponentId, type OverridableProps } from '../types';
import { filterValidOverridableProps } from '../utils/filter-valid-overridable-props';

export function useValidOverridableProps( componentId: ComponentId | null ): OverridableProps | undefined {
	const overridableProps = useOverridableProps( componentId );

	if ( ! overridableProps ) {
		return undefined;
	}

	return filterValidOverridableProps( overridableProps );
}
