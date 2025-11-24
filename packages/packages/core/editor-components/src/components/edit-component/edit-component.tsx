import * as React from 'react';
import { type Dispatch, type SetStateAction, useCallback, useEffect, useState } from 'react';
import { getV1CurrentDocument, getV1DocumentsManager, type V1Document } from '@elementor/editor-documents';
import { type V1Element } from '@elementor/editor-elements';
import {
	__privateListenTo as listenTo,
	__privateRunCommand as runCommand,
	commandEndEvent,
} from '@elementor/editor-v1-adapters';
import { __useDispatch as useDispatch } from '@elementor/store';

import { apiClient } from '../../api';
import { loadOverridableProps, saveOverrideProps } from '../../hooks/use-save-overide-props';
import { slice } from '../../store/store';
import { COMPONENT_DOCUMENT_TYPE } from '../consts';
import { ComponentModal } from './component-modal';

type ComponentsPathItem = {
	instanceId: string | undefined;
	component: V1Document;
};
export function EditComponent() {
	const [ componentsPath, setComponentsPath ] = useState< ComponentsPathItem[] >( [] );

	useHandleDocumentSwitches( componentsPath, setComponentsPath );
	const onBack = useNavigateBack( componentsPath );

	const currentItem = componentsPath.at( -1 );
	const { component: currentComponent } = currentItem ?? {};

	const widget = currentComponent?.container as V1Element;
	const container = ( widget?.view?.el?.children?.[ 0 ] ?? null ) as HTMLElement | null;
	const elementDom = container?.children[ 0 ] as HTMLElement | null;

	if ( ! elementDom ) {
		return null;
	}

	return <ComponentModal element={ elementDom } onClose={ onBack } />;
}

function useHandleDocumentSwitches(
	path: ComponentsPathItem[],
	setPath: Dispatch< SetStateAction< ComponentsPathItem[] > >
) {
	const documentsManager = getV1DocumentsManager();

	useEffect(
		() =>
			listenTo( commandEndEvent( 'editor/documents/attach-preview' ), () => {
				const { component: currentComponent } = path.at( -1 ) ?? {};
				const { id: currentComponentId } = currentComponent ?? {};
				const nextDocument = documentsManager.getCurrent();

				if ( nextDocument.id === currentComponentId ) {
					return;
				}

				if ( currentComponentId ) {
					apiClient.unlockComponent( currentComponentId );
					saveOverrideProps( currentComponentId );
				}

				const isComponent = nextDocument.config.type === COMPONENT_DOCUMENT_TYPE;

				if ( ! isComponent ) {
					setPath( [] );

					return;
				}

				setPath( getUpdatedComponentPath( path, nextDocument ) );
			} ),
		[ path, setPath, documentsManager ]
	);
}

function getUpdatedComponentPath( path: ComponentsPathItem[], nextDocument: V1Document ): ComponentsPathItem[] {
	const componentIndex = path.findIndex( ( { component } ) => component.id === nextDocument.id );

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
			component: nextDocument,
		},
	];
}

function useNavigateBack( path: ComponentsPathItem[] ) {
	const documentsManager = getV1DocumentsManager();

	return useCallback( () => {
		const { component: prevComponent, instanceId: prevComponentInstanceId } = path.at( -2 ) ?? {};
		const { id: prevComponentId } = prevComponent ?? {};
		const switchToDocument = ( id: number, selector?: string ) => {
			runCommand( 'editor/documents/switch', {
				id,
				selector,
				mode: 'autosave',
				setAsInitial: false,
				shouldScroll: false,
			} );
			console.log( 'edit mode' );
		};

		if ( prevComponentId && prevComponentInstanceId ) {
			switchToDocument( prevComponentId, `[data-id="${ prevComponentInstanceId }"]` );

			return;
		}

		switchToDocument( documentsManager.getInitialId() );
	}, [ path, documentsManager ] );
}
