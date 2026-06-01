import { getContainer, replaceElement, type V1Element, type V1ElementModelProps } from '@elementor/editor-elements';
import { undoable } from '@elementor/editor-v1-adapters';
import { __getState as getState } from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { componentInstanceOverridesPropTypeUtil } from '../../prop-types/component-instance-overrides-prop-type';
import {
	type ComponentInstanceProp,
	componentInstancePropTypeUtil,
} from '../../prop-types/component-instance-prop-type';
import { selectComponent } from '../../store/store';
import { getComponentDocumentData } from '../component-document-data';
import { trackComponentEvent } from '../tracking';
import { resolveDetachedInstance } from './resolve-detached-instance';

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
	originalInstanceModel: V1ElementModelProps;
	actionId: number;
};

type DetachEventData = {
	detachedInstanceId: string;
	detachActionId: number;
};

type UndoDetachEventData = {
	restoredInstanceId: string;
	detachActionId: number;
};

type RedoDetachEventData = DetachEventData;

const DETACH_EVENT = 'elementor/components/detach-instance';
const DETACH_UNDO_EVENT = 'elementor/components/undo-detach-instance';
const DETACH_REDO_EVENT = 'elementor/components/redo-detach-instance';

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

				const originalInstanceModel = instanceContainer.model.toJSON();

				const actionId = new Date().getTime();

				window.dispatchEvent(
					new CustomEvent( DETACH_EVENT, {
						detail: {
							detachedInstanceId: instanceId,
							detachActionId: actionId,
						} as DetachEventData,
					} )
				);

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
					originalInstanceModel,
					actionId,
				};
			},
			undo: ( _: undefined, { detachedElement, originalInstanceModel, actionId }: DoReturn ): V1Element => {
				const restoredInstance = replaceElement( {
					currentElementId: detachedElement.id,
					newElement: originalInstanceModel,
					withHistory: false,
				} );

				window.dispatchEvent(
					new CustomEvent( DETACH_UNDO_EVENT, {
						detail: {
							restoredInstanceId: restoredInstance.id,
							detachActionId: actionId,
						} as UndoDetachEventData,
					} )
				);

				return restoredInstance;
			},
			redo: ( _: undefined, doReturn: DoReturn, restoredInstance: V1Element ) => {
				const { detachedInstanceElementData, actionId } = doReturn;

				const detachedElement = replaceElement( {
					currentElementId: restoredInstance.id,
					newElement: detachedInstanceElementData,
					withHistory: false,
				} );

				window.dispatchEvent(
					new CustomEvent( DETACH_REDO_EVENT, {
						detail: {
							detachedInstanceId: detachedElement.id,
							detachActionId: actionId,
						} as RedoDetachEventData,
					} )
				);

				return {
					...doReturn,
					detachedElement,
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
