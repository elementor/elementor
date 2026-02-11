import * as React from 'react';
import { useEffect, useState } from 'react';
import { getV1DocumentsManager, type V1Document } from '@elementor/editor-documents';
import { type V1Element } from '@elementor/editor-elements';
import { __privateListenTo as listenTo, commandEndEvent } from '@elementor/editor-v1-adapters';
import { __useSelector as useSelector } from '@elementor/store';
import { throttle } from '@elementor/utils';

import { apiClient } from '../../api';
import { useNavigateBack } from '../../hooks/use-navigate-back';
import { resetSanitizedComponents } from '../../store/actions/reset-sanitized-components';
import { updateCurrentComponent } from '../../store/actions/update-current-component';
import { type ComponentsPathItem, selectPath, useCurrentComponentId } from '../../store/store';
import { COMPONENT_DOCUMENT_TYPE } from '../consts';
import { ComponentModal } from './component-modal';

export function EditComponent() {
	const currentComponentId = useCurrentComponentId();

	useHandleDocumentSwitches();

	const navigateBack = useNavigateBack();

	const onClose = throttle( navigateBack, 100 );

	const topLevelElementDom = useComponentDOMElement( currentComponentId ?? undefined );

	if ( ! currentComponentId ) {
		return null;
	}

	return <ComponentModal topLevelElementDom={ topLevelElementDom } onClose={ onClose } />;
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

			resetSanitizedComponents();

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

	const instanceId = nextDocument?.container.view?.el?.dataset.id;
	const instanceTitle = getInstanceTitle( instanceId, path );

	return [
		...path,
		{
			instanceId,
			instanceTitle,
			componentId: nextDocument.id,
		},
	];
}

function getInstanceTitle( instanceId: string | undefined, path: ComponentsPathItem[] ): string | undefined {
	if ( ! instanceId ) {
		return undefined;
	}

	const documentsManager = getV1DocumentsManager();
	const parentDocId = path.at( -1 )?.componentId ?? documentsManager.getInitialId();
	const parentDoc = documentsManager.get( parentDocId );

	type EditorSettings = { title?: string };
	type ContainerWithChildren = V1Element & {
		children?: {
			findRecursive?: ( predicate: ( child: V1Element ) => boolean ) => V1Element | undefined;
		};
	};

	const parentContainer = parentDoc?.container as unknown as ContainerWithChildren | undefined;
	const widget = parentContainer?.children?.findRecursive?.(
		( container: V1Element ) => container.id === instanceId
	);

	const editorSettings = widget?.model?.get?.( 'editor_settings' ) as EditorSettings | undefined;

	return editorSettings?.title;
}

function useComponentDOMElement( id: V1Document[ 'id' ] | undefined ) {
	const { componentContainerDomElement, topLevelElementDom } = getComponentDOMElements( id );

	const [ currentElementDom, setCurrentElementDom ] = useState< HTMLElement | null >( topLevelElementDom );

	useEffect( () => {
		setCurrentElementDom( topLevelElementDom );
	}, [ topLevelElementDom ] );

	useEffect( () => {
		if ( ! componentContainerDomElement ) {
			return;
		}

		const mutationObserver = new MutationObserver( () => {
			console.log( 'mutationObserver' );
			console.log( componentContainerDomElement );
			console.log( componentContainerDomElement.children[ 0 ].children[ 0 ] );
			const newElementDom = componentContainerDomElement.children[ 0 ].children[ 0 ] as HTMLElement | null;
			setCurrentElementDom( newElementDom );
		} );
		console.log( 'connecting mutationObserver' );
		console.log( componentContainerDomElement );
		console.log( componentContainerDomElement.children[ 0 ].children[ 0 ] );
		mutationObserver.observe( componentContainerDomElement, { childList: true, subtree: true, attributes: true, characterData: true } );

		return () => {
			mutationObserver.disconnect();
		};
	}, [ componentContainerDomElement ] );

	return currentElementDom;
}

type ComponentDOMElements = {
	componentContainerDomElement: HTMLElement | null;
	topLevelElementDom: HTMLElement | null;
};

function getComponentDOMElements( id: V1Document[ 'id' ] | undefined ): ComponentDOMElements {
	if ( ! id ) {
		return { componentContainerDomElement: null, topLevelElementDom: null };
	}

	const documentsManager = getV1DocumentsManager();

	const currentComponent = documentsManager.get( id );

	const componentContainer = currentComponent?.container as V1Element;
	const componentContainerDomElement = ( componentContainer?.view?.el as HTMLElement ) ?? null;
	const topLevelElementDom = ( componentContainerDomElement?.children[ 0 ].children[ 0 ] as HTMLElement ) ?? null;

	return { componentContainerDomElement, topLevelElementDom };
}
