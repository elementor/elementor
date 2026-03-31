import * as React from 'react';
import { getCurrentDocument } from '@elementor/editor-documents';
import {
	__privateUseListenTo as useListenTo,
	commandEndEvent,
	getCanvasIframeDocument,
} from '@elementor/editor-v1-adapters';
import { Portal } from '@elementor/ui';

import { useDocumentsCssLinks } from '../hooks/use-documents-css-links';
import { useStyleItems } from '../hooks/use-style-items';
import { type StyleItem } from '../renderers/create-styles-renderer';

export function StyleRenderer() {
	const container = usePortalContainer();

	if ( ! container ) {
		return null;
	}

	return <StyleRendererWithContainer container={ container } />;
}

type Props = {
	container: HTMLElement;
};

function StyleRendererWithContainer( { container }: Props ) {
	const styleItems = useStyleItems();
	const linksAttrs = useDocumentsCssLinks();

	return (
		<Portal container={ container }>
			{ filterUniqueStyleDefinitions( styleItems ).map( ( item ) => (
				<style key={ `${ item.id }-${ item.breakpoint }-${ item.state ?? 'normal' }` }>{ item.value }</style>
			) ) }
			{ linksAttrs.map( ( attrs ) => (
				<link { ...attrs } key={ attrs.id } />
			) ) }
		</Portal>
	);
}

function usePortalContainer() {
	/**
	 * Firefox's JS scheduler dispatches React's pending render microtasks earlier within the initialization macrotask boundary —
	 * before Load.apply() → setCurrent() has completed.
	 * Chrome processes these in the opposite order, so when React's mountMemo runs, currentDocument is already populated.
	 *
	 * In this listener - I'll first check if the currentDocument is available, and if it is, I'll return the canvasIframeDocument.head.
	 */
	return useListenTo( commandEndEvent( 'editor/documents/attach-preview' ), () =>
		getCurrentDocument() ? getCanvasIframeDocument()?.head : null
	);
}

// we load local styles also from components, which are handled differently
// to avoid having "Encountered two children with the same key" - adding this filtering to avoid rendering the same style twice
function filterUniqueStyleDefinitions( styleItems: StyleItem[] ) {
	const seen = new Map< string, StyleItem[] >();

	return styleItems.filter( ( style ) => {
		const existingStyle = seen.get( style.id );

		if ( existingStyle ) {
			const existingStyleVariant = existingStyle.find(
				( s ) => s.breakpoint === style.breakpoint && s.state === style.state
			);

			if ( existingStyleVariant ) {
				return false;
			}

			existingStyle.push( style );
			return true;
		}

		seen.set( style.id, [ style ] );
		return true;
	} );
}
