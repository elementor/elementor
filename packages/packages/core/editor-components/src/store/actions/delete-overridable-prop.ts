import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { type ComponentId, type OverridableProp } from '../../types';
import { revertElementOverridableSetting } from '../../utils/revert-overridable-settings';
import { type Source, trackComponentEvent } from '../../utils/tracking';
import { selectCurrentComponent, selectOverridableProps, slice } from '../store';
import { removePropFromAllGroups } from '../utils/groups-transformers';

type DeletePropParams = {
	componentId: ComponentId;
	propKey: string | string[];
	source: Source;
};

export function deleteOverridableProp( { componentId, propKey, source }: DeletePropParams ): void {
	const overridableProps = selectOverridableProps( getState(), componentId );

	if ( ! overridableProps || Object.keys( overridableProps.props ).length === 0 ) {
		return;
	}

	const propKeysToDelete = Array.isArray( propKey ) ? propKey : [ propKey ];
	const deletedProps: OverridableProp[] = [];

	for ( const key of propKeysToDelete ) {
		const prop = overridableProps.props[ key ];

		if ( ! prop ) {
			continue;
		}

		deletedProps.push( prop );
		revertElementOverridableSetting( prop.elementId, prop.propKey, prop.originValue, key );
	}

	if ( deletedProps.length === 0 ) {
		return;
	}

	const remainingProps = Object.fromEntries(
		Object.entries( overridableProps.props ).filter( ( [ key ] ) => ! propKeysToDelete.includes( key ) )
	);

	const updatedGroups = removePropFromAllGroups( overridableProps.groups, propKey );

	dispatch(
		slice.actions.setOverridableProps( {
			componentId,
			overridableProps: {
				...overridableProps,
				props: remainingProps,
				groups: updatedGroups,
			},
		} )
	);

	const currentComponent = selectCurrentComponent( getState() );

	for ( const prop of deletedProps ) {
		trackComponentEvent( {
			action: 'propertyRemoved',
			source,
			component_uid: currentComponent?.uid,
			property_id: prop.overrideKey,
			property_path: prop.propKey,
			property_name: prop.label,
			element_type: prop.widgetType ?? prop.elType,
		} );
	}
}
