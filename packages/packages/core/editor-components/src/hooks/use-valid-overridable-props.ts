import { deleteOverridableProp } from '../store/actions/delete-overridable-prop';
import { useOverridableProps } from '../store/store';
import { type ComponentId, type OverridableProps } from '../types';
import { filterValidOverridableProps } from '../utils/filter-valid-overridable-props';

export function useValidOverridableProps( componentId: ComponentId | null ): OverridableProps | undefined {
	const overridableProps = useOverridableProps( componentId );

	if ( ! overridableProps || ! componentId ) {
		return undefined;
	}

	const filteredOverridableProps = filterValidOverridableProps( overridableProps );

	const originalPropsArray = Object.entries( overridableProps.props ?? {} );
	const propsToDelete = originalPropsArray.filter( ( [ key ] ) => ! filteredOverridableProps.props[ key ] );

	propsToDelete.forEach( ( [ key ] ) => {
		deleteOverridableProp( { componentId, propKey: key, source: 'system' }, false );
	} );

	return filteredOverridableProps;
}
