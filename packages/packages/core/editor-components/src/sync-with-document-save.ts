import { getCurrentUser } from '@elementor/editor-current-user';
import { setDocumentModifiedStatus } from '@elementor/editor-documents';
import { registerDataHook } from '@elementor/editor-v1-adapters';
import { __getState as getState, __subscribeWithSelector as subscribeWithSelector } from '@elementor/store';

import './types';
import { apiClient } from './api';

export function syncWithDocumentSave() {
    bindSaveAction();
}

function bindSaveAction() {
    // Register a dependency hook that runs before save and handles components
    registerDataHook('dependency', 'document/save/save', (args) => {
        // setTimeout(() => {
        //     alert('dependency');
        // }, 10000);
        const createdComponents = window.components?.created || [];
        
        if (createdComponents.length === 0) {
            return true;
        }

        return saveComponents(createdComponents, args.status, args.document ).then(() => {
            return true;
        }).catch((error) => {
            console.error('Failed to save components:', error);
            return false;
        }).finally(() => {
            return true;
        });
    });
}

async function saveComponents(components: number[], status: 'publish' | 'draft', document: Document) {
    const promises = components.map((component) => saveComponent(component, status));
    const results = await Promise.all(promises);
    console.log('------------ results ------------');
    console.log(results);

    document.container.model.get( 'elements' ).map((el) => tempIdToComponentId(el, results ));

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

    window.elementor.documents.addDocumentByConfig(await elementor.documents.request( componentId ));

    return { tempId, componentId };
}

const tempIdToComponentId = (el, results) => {
    const tempIds = results.map((result) => result.tempId);
    if (el.widgetType === "e-component" && tempIds.includes(el.settings.component_id.value)) {
        el.settings.component_id.value = results.find((result) => result.tempId === el.settings.component_id.value).componentId;
    }
    if (el.elements) {
        el.elements = el.elements.map((e) => tempIdToComponentId(e, results));
    }
    return el;
}
