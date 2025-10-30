import * as React from 'react';
import { type Dispatch, type SetStateAction, useCallback, useEffect, useState } from 'react';
import { getV1DocumentsManager, type V1Document } from '@elementor/editor-documents';
import { type V1Element } from '@elementor/editor-elements';
import {
	__privateListenTo as listenTo,
	__privateRunCommand as runCommand,
	commandEndEvent,
} from '@elementor/editor-v1-adapters';
import { __useSelector as useSelector } from '@elementor/store';

import { apiClient } from '../../api';
import { selectComponentsObject } from '../../store/store';
import { ComponentModal } from './component-modal';

type DocumentsPathItem = {
	instanceId: string | undefined;
	document: V1Document;
	isComponent: boolean;
};

export function EditComponent() {
	const [ componentsPath, setComponentsPath ] = useState< DocumentsPathItem[] >( [] );

	useHandleDocumentSwitches( componentsPath, setComponentsPath );
	const onBack = useNavigateBack( componentsPath );

	const currentItem = componentsPath.at( -1 );
	const { isComponent = false, document: currentDocument } = currentItem ?? {};

	const widget = currentDocument?.container as V1Element;
	const elementDom = ( widget?.view?.el?.children?.[ 0 ] ?? null ) as HTMLElement | null;

	if ( ! isComponent || ! elementDom ) {
		return null;
	}

	return <ComponentModal element={ elementDom } onClose={ onBack } />;
}

function useHandleDocumentSwitches(
	path: DocumentsPathItem[],
	setPath: Dispatch< SetStateAction< DocumentsPathItem[] > >
) {
	const components = useSelector( selectComponentsObject );
	const documentsManager = getV1DocumentsManager();

	useEffect(() => {
		return listenTo( commandEndEvent( 'editor/documents/attach-preview' ), () => {
			const { document: currentDocument, isComponent: currentIsComponent } = path.at( -1 ) ?? {};
			const { id: currentDocumentId } = currentDocument ?? {};
			const nextDocument = documentsManager.getCurrent();

			if ( ! nextDocument || nextDocument.id === currentDocumentId ) {
				return;
			}

			const documentIndex = path.findIndex( ( { document } ) => document.id === nextDocument.id );

			if ( currentDocumentId && currentIsComponent ) {
				apiClient.unlockComponent( currentDocumentId );
			}

			if ( documentIndex >= 0 ) {
				setPath( path.slice( 0, documentIndex + 1 ) );

				return;
			}

			const instanceId = nextDocument?.container.view.el.dataset.id;
			const newItem: DocumentsPathItem = {
				instanceId,
				document: nextDocument,
				isComponent: !! components?.[ nextDocument.id ],
			};

			setPath( [ ...path, newItem ] );
		} );
	}, [path, setPath] );
}

function useNavigateBack( path: DocumentsPathItem[] ) {
	const documentsManager = getV1DocumentsManager();

	return useCallback( () => {
		const { document: prevDocument, instanceId: prevDocumentInstanceId } = path.at( -2 ) ?? {};
		const { id: prevDocumentId } = prevDocument ?? {};
		const switchToDocument = ( id: number, selector?: string ) => {
			runCommand( 'editor/documents/switch', {
				id,
				selector,
				mode: 'autosave',
				setAsInitial: false,
				shouldScroll: false,
			} );
		};

		if ( prevDocumentId && prevDocumentInstanceId ) {
			switchToDocument( prevDocumentId, `[data-id="${ prevDocumentInstanceId }"]` );

			return;
		}

		switchToDocument( documentsManager.getInitialId() );
	}, [ path, documentsManager ] );
}
