import { createElement, createElements, deleteElement, getContainer, replaceElement } from '@elementor/editor-elements';
import { __ } from '@wordpress/i18n';

import { componentInstanceOverridesPropTypeUtil } from '../prop-types/component-instance-overrides-prop-type';
import { type ComponentInstanceProp, componentInstancePropTypeUtil } from '../prop-types/component-instance-prop-type';
import { applyOverridesToElements } from './apply-overrides-to-elements';
import { getComponentDocumentData } from './component-document-data';
import { trackComponentEvent } from './tracking';

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

	const componentElements = componentData.elements ?? [];
	const overrides = extractInstanceOverrides( instanceContainer );

	const elementsWithOverrides = applyOverridesToElements( componentElements, overrides );

	const 

	replaceElement( {
		currentElementId: instanceId,
		newElement: elementsWithOverrides[ 0 ],
		withHistory: false,
	} );

	trackComponentEvent( {
		action: 'detached',
		source: 'user',
		component_id: componentId,
		instance_id: instanceId,
	} );
}

function extractInstanceOverrides( instanceContainer: ReturnType< typeof getContainer > ) {
	const settings = instanceContainer?.model.toJSON().settings;
	const componentInstance = componentInstancePropTypeUtil.extract(
		settings?.component_instance as ComponentInstanceProp
	);

	const overrides = componentInstanceOverridesPropTypeUtil.extract( componentInstance?.overrides );

	return overrides ?? [];
}
