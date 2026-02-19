import { createElement, createElements, deleteElement, getContainer } from '@elementor/editor-elements';
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

	const { parent } = instanceContainer;

	if ( ! parent ) {
		throw new Error( `Instance parent container not found.` );
	}

	const elementIndex = instanceContainer.view?._index ?? 0;

	const componentElements = componentData.elements ?? [];
	const overrides = extractInstanceOverrides( instanceContainer );

	const elementsWithOverrides = applyOverridesToElements( componentElements, overrides );

	const containerElement = createElement( {
		container: parent,
		model: {
			elType: 'e-flexbox' as const,
			settings: {},
		},
		options: {
			at: elementIndex,
			useHistory: false,
		},
	} );

	if ( elementsWithOverrides.length > 0 ) {
		createElements( {
			elements: elementsWithOverrides.map( ( element ) => ( {
				container: containerElement,
				model: element,
			} ) ),
			title: __( 'Instance Detached', 'elementor' ),
		} );
	}

	await deleteElement( {
		container: instanceContainer,
		options: {
			useHistory: false,
		},
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
