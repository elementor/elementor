import { useIsSanitizedComponent, useOverridableProps } from '../store/store';
import { type ComponentId, type OverridableProps } from '../types';
import { filterValidOverridableProps } from '../utils/filter-valid-overridable-props';

export function useSanitizeOverridableProps(
	componentId: ComponentId | null,
	instanceElementId?: string
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
