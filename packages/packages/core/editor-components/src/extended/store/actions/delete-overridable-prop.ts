import { componentsStore } from '../../../store/dispatchers';
import { type ComponentId, type OverridableProp } from '../../../types';
import { type Source, trackComponentEvent } from '../../../utils/tracking';
import { revertElementOverridableSetting } from '../../utils/revert-overridable-settings';
import { removePropFromAllGroups } from '../utils/groups-transformers';

type DeletePropParams = {
	componentId: ComponentId;
	propKey: string | string[];
	source: Source;
};

export function deleteOverridableProp( { componentId, propKey, source }: DeletePropParams ): void {
	const overridableProps = componentsStore.getOverridableProps( componentId );

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

	componentsStore.setOverridableProps( componentId, {
		...overridableProps,
		props: remainingProps,
		groups: updatedGroups,
	} );

	const currentComponent = componentsStore.getCurrentComponent();

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
