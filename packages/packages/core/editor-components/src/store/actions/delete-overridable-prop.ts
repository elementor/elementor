import { getContainer, updateElementSettings } from '@elementor/editor-elements';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { type ComponentId } from '../../types';
import { type Source, trackComponentEvent } from '../../utils/tracking';
import { selectCurrentComponent, selectOverridableProps, slice } from '../store';
import { removePropFromAllGroups } from '../utils/groups-transformers';

type DeletePropParams = {
	componentId: ComponentId;
	propKey: string;
	source: Source;
};

export function deleteOverridableProp( { componentId, propKey, source }: DeletePropParams ): void {
	const overridableProps = selectOverridableProps( getState(), componentId );

	if ( ! overridableProps ) {
		return;
	}

	const prop = overridableProps.props[ propKey ];

	if ( ! prop ) {
		return;
	}

	revertElementSetting( prop.elementId, prop.propKey, prop.originValue );

	const { [ propKey ]: removedProp, ...remainingProps } = overridableProps.props;

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

	trackComponentEvent( {
		action: 'propertyRemoved',
		source,
		component_uid: currentComponent?.uid,
		property_id: removedProp.overrideKey,
		property_path: removedProp.propKey,
		property_name: removedProp.label,
		element_type: removedProp.widgetType ?? removedProp.elType,
	} );
}

function revertElementSetting( elementId: string, settingKey: string, originValue: unknown ): void {
	const container = getContainer( elementId );

	if ( ! container ) {
		return;
	}

	updateElementSettings( {
		id: elementId,
		props: { [ settingKey ]: originValue ?? null },
		withHistory: false,
	} );
}
