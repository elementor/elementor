import { getContainer, replaceElement, type V1Element, type V1ElementModelProps } from '@elementor/editor-elements';
import { undoable } from '@elementor/editor-v1-adapters';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { componentInstanceOverridesPropTypeUtil } from '../prop-types/component-instance-overrides-prop-type';
import { type ComponentInstanceProp, componentInstancePropTypeUtil } from '../prop-types/component-instance-prop-type';
import { selectComponent, selectCurrentComponentId, selectOverridableProps, slice } from '../store/store';
import { type OverridableProps } from '../types';
import { getComponentDocumentData } from './component-document-data';
import { resolveDetachedInstance } from './resolve-detached-instance';
import { trackComponentEvent } from './tracking';

type DetachParams = {
	instanceId: string;
	componentId: number;
	trackingInfo: {
		location: string;
		secondaryLocation?: string;
		trigger: string;
	};
};

type DoReturn = {
	detachedElement: V1Element;
	detachedInstanceElementData: V1ElementModelProps;
	editedComponentOnDetach: number | null;
	overridablePropsBeforeDetach: OverridableProps | null;
	originalInstanceModel: V1ElementModelProps;
};

export async function detachComponentInstance( {
	instanceId,
	componentId,
	trackingInfo,
}: DetachParams ): Promise< DoReturn > {
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

	const undoableDetach = undoable(
		{
			do: (): DoReturn => {
				const overrides = extractInstanceOverrides( instanceContainer );
				const detachedInstanceElementData = resolveDetachedInstance(
					rootElement,
					overrides
				) as V1ElementModelProps;

				const editedComponentOnDetach = selectCurrentComponentId( getState() );
				// We need to store the overridable props of the current component before detach to restore them on undo.
				const overridablePropsBeforeDetach = editedComponentOnDetach
					? selectOverridableProps( getState(), editedComponentOnDetach ) ?? null
					: null;

				const originalInstanceModel = instanceContainer.model.toJSON();

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

				return {
					detachedElement,
					detachedInstanceElementData,
					editedComponentOnDetach,
					overridablePropsBeforeDetach,
					originalInstanceModel,
				};
			},
			undo: (
				_: undefined,
				{
					detachedElement,
					originalInstanceModel,
					overridablePropsBeforeDetach,
					editedComponentOnDetach,
				}: DoReturn
			): V1Element => {
				const restoredInstance = replaceElement( {
					currentElementId: detachedElement.id,
					newElement: originalInstanceModel,
					withHistory: false,
				} );

				const currentComponentId = selectCurrentComponentId( getState() );
				if (
					currentComponentId &&
					currentComponentId === editedComponentOnDetach &&
					overridablePropsBeforeDetach
				) {
					dispatch(
						slice.actions.setOverridableProps( {
							componentId: currentComponentId,
							overridableProps: overridablePropsBeforeDetach,
						} )
					);
				}

				return restoredInstance;
			},
			redo: ( _: undefined, doReturn: DoReturn, restoredInstance: V1Element ) => {
				const { detachedInstanceElementData } = doReturn;

				const editedComponentOnDetach = selectCurrentComponentId( getState() );
				// We need to store the overridable props of the current component before detach to restore them on undo.
				const overridablePropsBeforeDetach = editedComponentOnDetach
					? selectOverridableProps( getState(), editedComponentOnDetach ) ?? null
					: null;

				const detachedElement = replaceElement( {
					currentElementId: restoredInstance.id,
					newElement: detachedInstanceElementData,
					withHistory: false,
				} );

				return {
					...doReturn,
					detachedElement,
					editedComponentOnDetach,
					overridablePropsBeforeDetach,
				};
			},
		},
		{
			title: __( 'Detach from Component', 'elementor' ),
			subtitle: __( 'Instance detached', 'elementor' ),
		}
	);

	return undoableDetach();
}

function extractInstanceOverrides( instanceContainer: NonNullable< ReturnType< typeof getContainer > > ) {
	const settings = instanceContainer.model.toJSON().settings;
	const componentInstance = componentInstancePropTypeUtil.extract(
		settings?.component_instance as ComponentInstanceProp
	);

	const overrides = componentInstanceOverridesPropTypeUtil.extract( componentInstance?.overrides );

	return overrides ?? [];
}
