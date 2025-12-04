import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { getV1DocumentsManager, type V1Document } from '@elementor/editor-documents';
import { type V1Element } from '@elementor/editor-elements';
import {
	__privateListenTo as listenTo,
	__privateRunCommand as runCommand,
	commandEndEvent,
} from '@elementor/editor-v1-adapters';
import { __useSelector as useSelector } from '@elementor/store';

import { apiClient } from '../../api';
import { updateCurrentComponent } from '../../store/actions';
import { type ComponentsPathItem, selectCurrentComponentId, selectPath } from '../../store/store';
import { COMPONENT_DOCUMENT_TYPE } from '../consts';
import { ComponentModal } from './component-modal';

export function EditComponent() {
	const { path, currentComponentId } = useCurrentComponent();

	useHandleDocumentSwitches();

	const onBack = useNavigateBack( path );

	const elementDom = getComponentDOMElement( currentComponentId ?? undefined );

	if ( ! elementDom ) {
		return null;
	}

	return <ComponentModal element={ elementDom } onClose={ onBack } />;
}

function useHandleDocumentSwitches() {
	const documentsManager = getV1DocumentsManager();
	const { path, currentComponentId } = useCurrentComponent();

	useEffect( () => {
		return listenTo( commandEndEvent( 'editor/documents/attach-preview' ), () => {
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

function useNavigateBack( path: ComponentsPathItem[] ) {
	const documentsManager = getV1DocumentsManager();

	return useCallback( () => {
		const { componentId: prevComponentId, instanceId: prevComponentInstanceId } = path.at( -2 ) ?? {};

		const switchToDocument = ( id: number, selector?: string ) => {
			runCommand( 'editor/documents/switch', {
				id,
				selector,
				mode: 'autosave',
				setAsInitial: false,
				shouldScroll: false,
			} );
		};

		if ( prevComponentId && prevComponentInstanceId ) {
			switchToDocument( prevComponentId, `[data-id="${ prevComponentInstanceId }"]` );

			return;
		}

		switchToDocument( documentsManager.getInitialId() );
	}, [ path, documentsManager ] );
}

function useCurrentComponent() {
	const path = useSelector( selectPath );
	const currentComponentId = useSelector( selectCurrentComponentId );

	return {
		path,
		currentComponentId,
	};
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
