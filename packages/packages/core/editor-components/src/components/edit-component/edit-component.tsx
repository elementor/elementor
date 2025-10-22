import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { getV1DocumentsManager, type V1Document } from '@elementor/editor-documents';
import { __useNavigateToDocument as useNavigateToDocument } from '@elementor/editor-documents';
import { type V1Element } from '@elementor/editor-elements';
import { registerDataHook } from '@elementor/editor-v1-adapters';
import { __useSelector as useSelector } from '@elementor/store';

import { selectComponentsObject, selectLoadIsPending } from '../../store/store';
import { ComponentModal } from './component-modal';

export function EditComponent() {
	const documentsManager = getV1DocumentsManager();
	const [ currentDocument, setCurrentDocument ] = useState< V1Document | null >( null );
	const switchToDocument = useNavigateToDocument();
	const componentsPath = useRef< [ number, string | undefined ][] >( [] );
	const components = useSelector( selectComponentsObject );
	const isLoading = useSelector( selectLoadIsPending );

	const onBack = () => {
		const [ lastDocumentId, lastDocumentInstanceId ] = componentsPath.current.pop() ?? [];

		if ( lastDocumentId && lastDocumentInstanceId ) {
			switchToDocument(
				lastDocumentId,
				{
					mode: 'autosave',
					selector: `[data-id="${ lastDocumentInstanceId }"]`,
					setAsInitial: false,
				},
				false
			);
		} else {
			switchToDocument( documentsManager.getInitialId(), { mode: 'autosave', setAsInitial: false } );
		}

		setCurrentDocument( null );
	};

	useOnMount( () => {
		registerDataHook( 'after', 'editor/documents/attach-preview', () => {
			const nextDocument = documentsManager.getCurrent();

			if ( ! nextDocument ) {
				return;
			}

			setCurrentDocument( ( current ) => {
				if ( current?.id === nextDocument.id ) {
					return current;
				}

				const instanceId = current?.container.view.el.dataset.id;

				if (
					current?.id &&
					! componentsPath.current.find( ( [ id, iId ] ) => id === current.id && iId === instanceId )
				) {
					componentsPath.current.push( [ current.id, instanceId ] );
				}

				return nextDocument;
			} );
		} );
	} );

	const isComponent = ! isLoading && currentDocument ? !! components[ currentDocument.id ] : false;

	const widget = currentDocument?.container as V1Element;
	const elementDom = ( widget?.view?.el?.children?.[ 0 ] ?? null ) as HTMLElement | null;

	if ( ! isComponent || ! elementDom ) {
		return null;
	}

	return <ComponentModal element={ elementDom } onClose={ onBack } />;
}

function useOnMount( cb: () => void ) {
	const mounted = useRef( false );

	useEffect( () => {
		if ( ! mounted.current ) {
			mounted.current = true;

			cb();
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps
}
