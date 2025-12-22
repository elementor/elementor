import * as React from 'react';
import { useEffect } from 'react';
import { getV1DocumentsManager, type V1Document } from '@elementor/editor-documents';
import { type V1Element } from '@elementor/editor-elements';
import { __privateListenTo as listenTo, commandEndEvent } from '@elementor/editor-v1-adapters';
import { __useSelector as useSelector } from '@elementor/store';
import { throttle } from '@elementor/utils';

import { apiClient } from '../../api';
import { useNavigateBack } from '../../hooks/use-navigate-back';
import { updateCurrentComponent } from '../../store/actions/update-current-component';
import { type ComponentsPathItem, selectPath, useCurrentComponentId } from '../../store/store';
import { COMPONENT_DOCUMENT_TYPE } from '../consts';
import { ComponentModal } from './component-modal';

export function EditComponent() {
	const currentComponentId = useCurrentComponentId();

	useHandleDocumentSwitches();

	const navigateBack = useNavigateBack();

	const onClose = throttle( navigateBack, 100 );

	const elementDom = getComponentDOMElement( currentComponentId ?? undefined );

	if ( ! elementDom ) {
		return null;
	}

	return <ComponentModal element={ elementDom } onClose={ onClose } />;
}

function useHandleDocumentSwitches() {
	const documentsManager = getV1DocumentsManager();
	const currentComponentId = useCurrentComponentId();
	const path = useSelector( selectPath );

	useEffect( () => {
		return listenTo( commandEndEvent( 'editor/documents/open' ), () => {
			const nextDocument = documentsManager.getCurrent();

			if ( nextDocument.id === currentComponentId ) {
				return;
			}

			if ( currentComponentId ) {
				apiClient.unlockComponent( currentComponentId );
			}

			const isComponent = nextDocument.config.type === COMPONENT_DOCUMENT_TYPE;

			if ( ! isComponent ) {
				updateCurrentComponent( { path: [], currentComponentId: null } );
				return;
			}

			updateCurrentComponent( {
				path: getUpdatedComponentPath( path, nextDocument ),
				currentComponentId: nextDocument.id,
			} );
		} );
	}, [ path, documentsManager, currentComponentId ] );
}

function getUpdatedComponentPath( path: ComponentsPathItem[], nextDocument: V1Document ): ComponentsPathItem[] {
	const componentIndex = path.findIndex( ( { componentId } ) => componentId === nextDocument.id );

	if ( componentIndex >= 0 ) {
		// When exiting the editing of a nested component - we in fact go back a step
		// so we need to make sure the path is cleaned up of any newer items
		// By doing it with the slice and not a simple pop() - we could jump to any component in the path and make sure it becomes the current one
		return path.slice( 0, componentIndex + 1 );
	}

	return [
		...path,
		{
			instanceId: nextDocument?.container.view?.el?.dataset.id,
			componentId: nextDocument.id,
		},
	];
}

function getComponentDOMElement( id: V1Document[ 'id' ] | undefined ) {
	if ( ! id ) {
		return null;
	}

	const documentsManager = getV1DocumentsManager();

	const currentComponent = documentsManager.get( id );

	const widget = currentComponent?.container as V1Element;
	const container = ( widget?.view?.el?.children?.[ 0 ] ?? null ) as HTMLElement | null;
	const elementDom = container?.children[ 0 ] as HTMLElement | null;

	return elementDom ?? null;
}
