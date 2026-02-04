import { addSanitizedComponent } from '../store/actions/add-sanitized-component';
import { deleteOverridableProp } from '../store/actions/delete-overridable-prop';
import { useIsSanitizedComponent, useOverridableProps } from '../store/store';
import { type ComponentId, type OverridableProps } from '../types';
import { filterValidOverridableProps } from '../utils/filter-valid-overridable-props';

export function useValidOverridableProps( componentId: ComponentId | null ): OverridableProps | undefined {
	const overridableProps = useOverridableProps( componentId );
	const isSanitized = useIsSanitizedComponent( componentId );

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

	addSanitizedComponent( componentId );

	return filteredOverridableProps;
}
