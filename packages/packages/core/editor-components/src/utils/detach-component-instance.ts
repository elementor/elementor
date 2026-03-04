import { getContainer, replaceElement, type V1Element, type V1ElementModelProps } from '@elementor/editor-elements';
import { undoable } from '@elementor/editor-v1-adapters';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { componentInstanceOverridesPropTypeUtil } from '../prop-types/component-instance-overrides-prop-type';
import { type ComponentInstanceProp, componentInstancePropTypeUtil } from '../prop-types/component-instance-prop-type';
import {
	type ComponentsSlice,
	selectComponent,
	selectCurrentComponentId,
	selectOverridableProps,
	slice,
} from '../store/store';
import { getComponentDocumentData } from './component-document-data';
import { resolveDetachedInstance } from './resolve-detached-instance';
import { trackComponentEvent } from './tracking';

type DetachParams = {
	instanceId: string;
	componentId: number;
	trackingInfo: PerformDetachParams[ 'trackingInfo' ];
};

export async function detachComponentInstance( {
	instanceId,
	componentId,
	trackingInfo,
}: DetachParams ): Promise< V1Element > {
	const instanceContainer = getContainer( instanceId );

	if ( ! instanceContainer ) {
		throw new Error( `Instance container with ID "${ instanceId }" not found.` );
	}

	const componentData = await getComponentDocumentData( componentId );

	if ( ! componentData ) {
		throw new Error( `Component with ID "${ componentId }" not found.` );
	}

	const rootElement = componentData.elements?.[ 0 ];

	if ( ! rootElement ) {
		throw new Error( `Component with ID "${ componentId }" has no root element.` );
	}

	const overrides = extractInstanceOverrides( instanceContainer );
	const detachedInstanceElementData = resolveDetachedInstance( rootElement, overrides ) as V1ElementModelProps;

	const state = getState() as ComponentsSlice | undefined;
	const currentComponentId = state ? selectCurrentComponentId( state ) : null;
	const originalOverridableProps =
		currentComponentId && state ? selectOverridableProps( state, currentComponentId ) : null;

	const originalInstanceModel = instanceContainer.model.toJSON();

	const undoableDetach = undoable(
		{
			do: (): V1Element => {
				return performDetach( { instanceId, detachedInstanceElementData, componentId, trackingInfo } );
			},
			undo: ( _: undefined, detachedElement: V1Element ): V1Element => {
				const restoredInstance = replaceElement( {
					currentElementId: detachedElement.id,
					newElement: originalInstanceModel,
					withHistory: false,
				} );

				if ( originalOverridableProps ) {
					const undoState = getState() as ComponentsSlice | undefined;
					const undoCurrentComponentId = undoState ? selectCurrentComponentId( undoState ) : null;

					if ( undoCurrentComponentId ) {
						dispatch(
							slice.actions.setOverridableProps( {
								componentId: undoCurrentComponentId,
								overridableProps: originalOverridableProps,
							} )
						);
					}
				}

				return restoredInstance;
			},
			redo: ( _: undefined, _doReturn: V1Element, restoredInstance: V1Element ) => {
				return performDetach( {
					instanceId: restoredInstance.id,
					detachedInstanceElementData,
					componentId,
					trackingInfo,
				} );
			},
		},
		{
			title: __( 'Detach from Component', 'elementor' ),
			subtitle: __( 'Instance detached', 'elementor' ),
		}
	);

	return undoableDetach();
}

type PerformDetachParams = {
	instanceId: string;
	detachedInstanceElementData: V1ElementModelProps;
	componentId: number;
	trackingInfo: {
		location: string;
		secondaryLocation?: string;
		trigger: string;
	};
};

function performDetach( { instanceId, detachedInstanceElementData, componentId, trackingInfo }: PerformDetachParams ) {
	const detachedElement = replaceElement( {
		currentElementId: instanceId,
		newElement: detachedInstanceElementData,
		withHistory: false,
	} );

	const componentUid = selectComponent( getState(), componentId )?.uid;

	trackComponentEvent( {
		action: 'detached',
		source: 'user',
		component_uid: componentUid,
		instance_id: instanceId,
		location: trackingInfo.location,
		secondary_location: trackingInfo.secondaryLocation,
		trigger: trackingInfo.trigger,
	} );

	return detachedElement;
}

function extractInstanceOverrides( instanceContainer: NonNullable< ReturnType< typeof getContainer > > ) {
	const settings = instanceContainer.model.toJSON().settings;
	const componentInstance = componentInstancePropTypeUtil.extract(
		settings?.component_instance as ComponentInstanceProp
	);

	const overrides = componentInstanceOverridesPropTypeUtil.extract( componentInstance?.overrides );

	return overrides ?? [];
}
