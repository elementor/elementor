import { useIsSanitizedComponent, useOverridableProps } from '../store/store';
import { type ComponentId, type OverridableProps } from '../types';
import { filterValidOverridableProps } from '../utils/filter-valid-overridable-props';

export function useSanitizeOverridableProps(
	componentId: ComponentId | null,
	instanceElementId?: string
	// instanceElementId is used to find the component inner elements,
	// and should be passed when editing component instance (not in component edit mode)
): OverridableProps | undefined {
	const overridableProps = useOverridableProps( componentId );
	const isSanitized = useIsSanitizedComponent( componentId, 'overridableProps' );

	if ( ! overridableProps || ! componentId ) {
		return undefined;
	}

	if ( isSanitized ) {
		return overridableProps;
	}

	return filterValidOverridableProps( overridableProps, instanceElementId );
}
