import * as React from 'react';
import { type Dispatch, type MutableRefObject, type SetStateAction, useRef, useState } from 'react';
import { getV1DocumentsManager, type V1Document } from '@elementor/editor-documents';
import { __useNavigateToDocument as useNavigateToDocument } from '@elementor/editor-documents';
import { type V1Element } from '@elementor/editor-elements';
import { registerDataHook } from '@elementor/editor-v1-adapters';
import { __useSelector as useSelector } from '@elementor/store';
import { useOnMount } from '@elementor/utils';

import { selectComponentsObject, selectLoadIsPending } from '../../store/store';
import { ComponentModal } from './component-modal';

export function EditComponent() {
	const [ currentDocument, setCurrentDocument ] = useState< V1Document | null >( null );
	const componentsPath = useRef< [ number, string | undefined ][] >( [] );
	const components = useSelector( selectComponentsObject );
	const isLoading = useSelector( selectLoadIsPending );

	useHandleDocumentSwitches( setCurrentDocument, componentsPath );
	const onBack = useNavigateBack( componentsPath );

	const isComponent = ! isLoading && currentDocument ? !! components[ currentDocument.id ] : false;

	const widget = currentDocument?.container as V1Element;
	const elementDom = ( widget?.view?.el?.children?.[ 0 ] ?? null ) as HTMLElement | null;

	if ( ! isComponent || ! elementDom ) {
		return null;
	}

	return <ComponentModal element={ elementDom } onClose={ onBack } />;
}

function useHandleDocumentSwitches(
	setDocument: Dispatch< SetStateAction< V1Document | null > >,
	path: MutableRefObject< [ number, string | undefined ][] >
) {
	useOnMount( () => {
		const documentsManager = getV1DocumentsManager();

		registerDataHook( 'after', 'editor/documents/attach-preview', () => {
			const nextDocument = documentsManager.getCurrent();

			if ( ! nextDocument ) {
				return;
			}

			setDocument( ( current: V1Document | null ) => {
				if ( current?.id === nextDocument.id ) {
					return current;
				}

				const instanceId = nextDocument?.container.view.el.dataset.id;

				if ( ! path.current.find( ( [ id ] ) => id === nextDocument.id ) ) {
					path.current.push( [ nextDocument.id, instanceId ] );
				}

				return nextDocument;
			} );
		} );
	} );
}

function useNavigateBack( path: MutableRefObject< [ number, string | undefined ][] > ) {
	const switchToDocument = useNavigateToDocument();
	const documentsManager = getV1DocumentsManager();

	return () => {
		path.current.pop();
		const [ lastDocumentId, lastDocumentInstanceId ] = path.current.at( -1 ) ?? [];

		if ( lastDocumentId && lastDocumentInstanceId ) {
			switchToDocument(
				lastDocumentId,
				{
					mode: 'autosave',
					selector: `[data-id="${ lastDocumentInstanceId }"]`,
					setAsInitial: false,
					shouldScroll: false,
				},
				false
			);
		} else {
			switchToDocument( documentsManager.getInitialId(), {
				mode: 'autosave',
				setAsInitial: false,
				shouldScroll: false,
			} );
		}
	};
}
