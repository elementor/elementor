import * as React from 'react';
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

	const styleItems = useStyleItems();
	const linksAttrs = useDocumentsCssLinks();

	if ( ! container ) {
		return null;
	}

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
	return useListenTo( commandEndEvent( 'editor/documents/attach-preview' ), () => getCanvasIframeDocument()?.head );
}

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
