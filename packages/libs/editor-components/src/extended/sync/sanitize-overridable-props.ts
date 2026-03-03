import { useEffect } from 'react';

import { useCurrentComponentId, useIsSanitizedComponent, useOverridableProps } from '../../store/store';
import { filterValidOverridableProps } from '../../utils/filter-valid-overridable-props';
import { deleteOverridableProp } from '../store/actions/delete-overridable-prop';
import { updateComponentSanitizedAttribute } from '../store/actions/update-component-sanitized-attribute';

export function SanitizeOverridableProps() {
	const currentComponentId = useCurrentComponentId();
	const overridableProps = useOverridableProps( currentComponentId );
	const isSanitized = useIsSanitizedComponent( currentComponentId, 'overridableProps' );

	useEffect( () => {
		if ( isSanitized || ! overridableProps || ! currentComponentId ) {
			return;
		}

		const filtered = filterValidOverridableProps( overridableProps );

		const propsToDelete = Object.keys( overridableProps.props ?? {} ).filter( ( key ) => ! filtered.props[ key ] );

		if ( propsToDelete.length > 0 ) {
			propsToDelete.forEach( ( key ) => {
				deleteOverridableProp( { componentId: currentComponentId, propKey: key, source: 'system' } );
			} );
		}

		updateComponentSanitizedAttribute( currentComponentId, 'overridableProps' );
	}, [ currentComponentId, isSanitized, overridableProps ] );

	return null;
}
