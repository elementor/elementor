import { getContainer, updateElementSettings } from '@elementor/editor-elements';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { type ComponentId } from '../../types';
import { selectOverridableProps, slice } from '../store';
import { removePropFromAllGroups } from '../utils/groups-transformers';

type DeletePropParams = {
	componentId: ComponentId;
	propKey: string;
	skipRevert?: boolean;
};

export function deleteOverridableProp( { componentId, propKey, skipRevert = false }: DeletePropParams ): void {
	const overridableProps = selectOverridableProps( getState(), componentId );

	if ( ! overridableProps ) {
		return;
	}

	const prop = overridableProps.props[ propKey ];

	if ( ! prop ) {
		return;
	}

	if ( ! skipRevert ) {
		revertElementSetting( prop.elementId, prop.propKey, prop.originValue );
	}

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
