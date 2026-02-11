import { useEffect } from 'react';

import { deleteOverridableProp } from '../store/actions/delete-overridable-prop';
import { updateComponentSanitizedAttribute } from '../store/actions/update-component-sanitized-attribute';
import { useIsSanitizedComponent, useOverridableProps } from '../store/store';
import { type ComponentId, type OverridableProps } from '../types';
import { filterValidOverridableProps } from '../utils/filter-valid-overridable-props';

/**
 * Sanitizes overridable props by filtering out invalid ones.
 *
 * When `instanceElementId` is provided (editing a component instance), filters props
 * using prefixed runtime IDs for nested component lookups.
 *
 * When `instanceElementId` is undefined (editing the component itself), filters props
 * using original IDs without prefixing.
 * @param componentId
 * @param instanceElementId
 */
export function useSanitizeOverridableProps(
	componentId: ComponentId | null,
	instanceElementId?: string
): OverridableProps | undefined {
	const overridableProps = useOverridableProps( componentId );
	const isSanitized = useIsSanitizedComponent( componentId, 'overridableProps' );

	// useEffect( () => {
		if ( ! overridableProps || ! componentId ) {
			return;
		}

		const filteredProps = filterValidOverridableProps( overridableProps, instanceElementId );

		Object.keys( overridableProps.props ?? {} )
			.filter( ( key ) => ! filteredProps.props[ key ] )
			.forEach( ( key ) => {
				deleteOverridableProp( { componentId, propKey: key, source: 'system', instanceElementId } );
			} );

		updateComponentSanitizedAttribute( componentId, 'overridableProps' );
	// }, [ isSanitized, overridableProps, componentId, instanceElementId ] );

	// if ( ! overridableProps || ! componentId ) {
	// 	return undefined;
	// }

	if ( isSanitized ) {
		return overridableProps;
	}

	return filterValidOverridableProps( overridableProps, instanceElementId );
}
