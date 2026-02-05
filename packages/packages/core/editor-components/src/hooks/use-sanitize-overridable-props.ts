import { deleteOverridableProp } from '../store/actions/delete-overridable-prop';
import { updateComponentSanitizedAttribute } from '../store/actions/update-component-sanitized-attribute';
import { useIsSanitizedComponent, useOverridableProps } from '../store/store';
import { type ComponentId, type OverridableProps } from '../types';
import { filterValidOverridableProps } from '../utils/filter-valid-overridable-props';

export function useSanitizeOverridableProps( componentId: ComponentId | null ): OverridableProps | undefined {
	const overridableProps = useOverridableProps( componentId );
	const isSanitized = useIsSanitizedComponent( componentId, 'overridableProps' );

	if ( ! overridableProps || ! componentId ) {
		return undefined;
	}

	if ( isSanitized ) {
		return overridableProps;
	}

	const filteredOverridableProps = filterValidOverridableProps( overridableProps );

	const originalPropsArray = Object.entries( overridableProps.props ?? {} );
	const propsToDelete = originalPropsArray.filter( ( [ key ] ) => ! filteredOverridableProps.props[ key ] );

	propsToDelete.forEach( ( [ key ] ) => {
		deleteOverridableProp( { componentId, propKey: key, source: 'system' } );
	} );

	updateComponentSanitizedAttribute( componentId, 'overridableProps' );

	return filteredOverridableProps;
}
