import { injectIntoLogic, injectIntoTop } from '@elementor/editor';
import { injectTab } from '@elementor/editor-elements-panel';
import { __ } from '@wordpress/i18n';

import './types';

import { ComponentsTab } from './components/components-tab';
import { CreateComponentForm } from './components/create-component-form/create-component-form';
import { SyncWithDocumentSave } from './sync-with-document';
import { updateElementSettings, UpdateElementSettingsArgs } from '@elementor/editor-elements';
import { apiClient } from './api';
import { numberPropTypeUtil } from '@elementor/editor-props';

export function init() {
	injectTab( {
		id: 'components',
		label: __( 'Components', 'elementor' ),
		component: ComponentsTab,
	} );

	injectIntoTop( {
		id: 'create-component-popup',
		component: CreateComponentForm,
	} );

	window.components = {
		created: [],
		modified: [],
		deleted: [],
	};

	window.myCustomSave = async({container, status}) => {
		const createdComponents = window.components?.created || [];
        
        if (createdComponents.length === 0) {
            return;
        }

        await saveComponents(createdComponents, status, container);
	};

	injectIntoLogic({
		id: 'components-sync-with-document',
		component: SyncWithDocumentSave,
	});
}

async function saveComponents(components: number[], status: 'publish' | 'draft', container) {
    const promises = components.map((component) => saveComponent(component, status));
    const results = await Promise.all(promises);
    console.log('------------ results ------------');
    console.log(results);

	loopThroughElements(container.model.get( 'elements' ).toJSON(), results);
    // container.model.get( 'elements' ).map((el) => tempIdToComponentId(el, results ));

    window.components.created = [];
}

async function saveComponent(tempId: number, status: 'publish' | 'draft') {
    const component = window.elementor.documents.documents[tempId].config;

    console.log('------------ component ------------');
    console.log({ tempId,         name: component.settings.settings.post_title, });
    const { component_id: componentId } = await apiClient.create({
        name: component.settings.settings.post_title,
        content: component.elements,
        status,
    });

    window.elementor.documents.addDocumentByConfig(await window.elementor.documents.request( componentId ));

    return { tempId, componentId };
}

const loopThroughElements = (elements, results) => {
	const tempIds = results.map((result) => result.tempId);
    elements.forEach((element) => {
        if (element.widgetType === "e-component" && tempIds.includes(element.settings.component_id.value)) {
			const componentId = results.find((result) => result.tempId === element.settings.component_id.value).componentId;
            updateElementSettings( { id: element.id, props: { component_id: numberPropTypeUtil.create( componentId ), }, withHistory: false });

        }
		if (element.elements) {
			loopThroughElements(element.elements, results);
		}
    });
}

// const tempIdToComponentId = (el, results) => {
//     const tempIds = results.map((result) => result.tempId);
//     if (el.widgetType === "e-component" && tempIds.includes(el.settings.component_id.value)) {
//         el.settings.component_id.value = results.find((result) => result.tempId === el.settings.component_id.value).componentId;
//     }
//     if (el.elements) {
//         el.elements = el.elements.map((e) => tempIdToComponentId(e, results));
//     }
//     return el;
// }
