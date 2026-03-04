import { getContainer, replaceElement } from '@elementor/editor-elements';

import { componentInstanceOverridesPropTypeUtil } from '../prop-types/component-instance-overrides-prop-type';
import { type ComponentInstanceProp, componentInstancePropTypeUtil } from '../prop-types/component-instance-prop-type';
import { getComponentDocumentData } from './component-document-data';
import { resolveDetachedInstance } from './resolve-detached-instance';
import { trackComponentEvent } from './tracking';

export type DetachComponentInstanceResult = {
	idMapping: Map< string, string >;
};

export async function detachComponentInstance( {
	instanceId,
	componentId,
}: {
	instanceId: string;
	componentId: number;
} ): Promise< void > {
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
	const elementWithAppliedOverrides = resolveDetachedInstance( structuredClone( rootElement ), overrides );

	await replaceElement( {
		currentElementId: instanceId,
		newElement: elementWithAppliedOverrides as Parameters< typeof replaceElement >[ 0 ][ 'newElement' ],
		withHistory: true,
	} );

	trackComponentEvent( {
		action: 'detached',
		source: 'user',
		component_id: componentId,
		instance_id: instanceId,
	} );
}

function extractInstanceOverrides( instanceContainer: NonNullable< ReturnType< typeof getContainer > > ) {
	const settings = instanceContainer.model.toJSON().settings;
	const componentInstance = componentInstancePropTypeUtil.extract(
		settings?.component_instance as ComponentInstanceProp
	);

	const overrides = componentInstanceOverridesPropTypeUtil.extract( componentInstance?.overrides );

	return overrides ?? [];
}
