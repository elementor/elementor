import { injectIntoLogic, injectIntoTop } from '@elementor/editor';
import { injectTab } from '@elementor/editor-elements-panel';
import { __ } from '@wordpress/i18n';

import './types';

import { updateElementSettings, UpdateElementSettingsArgs } from '@elementor/editor-elements';
import { apiClient } from './api';
import { numberPropTypeUtil } from '@elementor/editor-props';
import { __registerSlice as registerSlice } from '@elementor/store';

import { Components } from './components/components-tab/components';
import { CreateComponentForm } from './components/create-component-form/create-component-form';
import { PopulateStore } from './populate-store';
import { slice } from './store';

export function init() {
	registerSlice( slice );

	injectTab( {
		id: 'components',
		label: __( 'Components', 'elementor' ),
		component: Components,
	} );

	injectIntoTop( {
		id: 'create-component-popup',
		component: CreateComponentForm,
	} );

	injectIntoLogic( {
		id: 'components-populate-store',
		component: PopulateStore,
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
}

async function saveComponents(components: number[], status: 'publish' | 'draft', container) {
    const promises = components.map((component) => saveComponent(component, status));
    const results = await Promise.all(promises);

	loopThroughElements(container.model.get( 'elements' ).toJSON(), results);

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
