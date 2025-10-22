import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { getV1DocumentsManager, type V1Document } from '@elementor/editor-documents';
import { type V1Element } from '@elementor/editor-elements';
import { registerDataHook } from '@elementor/editor-v1-adapters';
import { __useSelector as useSelector } from '@elementor/store';

import { selectComponentsObject, selectLoadIsPending } from '../../store/store';
import { ComponentModal } from './component-modal';

export function EditComponent() {
	const documentsManager = getV1DocumentsManager();
	const [ currentDocument, setCurrentDocument ] = useState< V1Document | null >( null );
	const components = useSelector( selectComponentsObject );
	const isLoading = useSelector( selectLoadIsPending );

	useOnMount( () => {
		registerDataHook( 'after', 'editor/documents/attach-preview', () => {
			const nextDocument = documentsManager.getCurrent();

			if ( ! nextDocument ) {
				return;
			}

			if ( currentDocument?.id === nextDocument.id ) {
				return;
			}

			setCurrentDocument( nextDocument );
		} );
	} );

	const isComponent = ! isLoading && currentDocument ? !! components[ currentDocument.id ] : false;

	const widget = currentDocument?.container as V1Element;
	const elementDom = ( widget?.view?.el?.children?.[ 0 ] ?? null ) as HTMLElement | null;

	if ( ! isComponent || ! elementDom || ! currentDocument?.id ) {
		return null;
	}

	return <ComponentModal element={ elementDom } revertId={ documentsManager.getInitialId() } />;
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
