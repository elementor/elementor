import { deleteOverridableProp } from '../extended/store/actions/delete-overridable-prop';
import { updateComponentSanitizedAttribute } from '../extended/store/actions/update-component-sanitized-attribute';
import { useIsSanitizedComponent, useOverridableProps } from '../store/store';
import { type ComponentId, type OverridableProps } from '../types';
import { filterValidOverridableProps } from '../utils/filter-valid-overridable-props';

export function useSanitizeOverridableProps(
	componentId: ComponentId | null,
	// instanceElementId is used to find the component inner elements,
	// and should be passed when editing component instance (not in component edit mode)
	instanceElementId?: string
): OverridableProps | undefined {
	const overridableProps = useOverridableProps( componentId );
	const isSanitized = useIsSanitizedComponent( componentId, 'overridableProps' );

	if ( ! overridableProps || ! componentId ) {
		return undefined;
	}

	// return overridableProps;

	if ( isSanitized ) {
		return overridableProps;
	}

	const filteredOverridableProps = filterValidOverridableProps( overridableProps, instanceElementId );

	const originalPropsArray = Object.entries( overridableProps.props ?? {} );
	const propsToDelete = originalPropsArray.filter( ( [ key ] ) => ! filteredOverridableProps.props[ key ] );

	propsToDelete.forEach( ( [ key ] ) => {
		deleteOverridableProp( { componentId, propKey: key, source: 'system' } );
	} );

	updateComponentSanitizedAttribute( componentId, 'overridableProps' );

	return filteredOverridableProps;
}
