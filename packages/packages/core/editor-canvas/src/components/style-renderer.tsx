import * as React from 'react';
import {
	__privateUseListenTo as useListenTo,
	commandEndEvent,
	getCanvasIframeDocument,
} from '@elementor/editor-v1-adapters';
import { Portal } from '@elementor/ui';

import { useDocumentsCssLinks } from '../hooks/use-documents-css-links';
import { useStyleItems } from '../hooks/use-style-items';

export function StyleRenderer() {
	const container = usePortalContainer();

	const styleItems = useStyleItems();
	const linksAttrs = useDocumentsCssLinks();

	if ( ! container ) {
		return null;
	}

	return (
		<Portal container={ container }>
			{ styleItems.map( ( item, i ) => (
				<style key={ `${ item.id }-${ i }-${ item.breakpoint }` }>{ item.value }</style>
			) ) }
			{ linksAttrs.map( ( attrs ) => (
				<link { ...attrs } key={ attrs.id } />
			) ) }
		</Portal>
	);
}

function usePortalContainer() {
	return useListenTo( commandEndEvent( 'editor/documents/attach-preview' ), () => getCanvasIframeDocument()?.head );
}
