import * as React from 'react';
import { __privateUseListenTo as useListenTo, commandEndEvent } from '@elementor/editor-v1-adapters';
import { Portal } from '@elementor/ui';

import { useInteractionsItems } from '../hooks/use-interactions-items';
import { getCanvasIframeDocument } from '../sync/get-canvas-iframe-document';

export function InteractionsRenderer() {
	const container = usePortalContainer();
	const interactionItems = useInteractionsItems();

	if ( ! container ) {
		return null;
	}

	const interactionsData = JSON.stringify( Array.isArray( interactionItems ) ? interactionItems : [] );

	return (
		<Portal container={ container }>
			<script
				type="application/json"
				data-e-interactions="true"
				dangerouslySetInnerHTML={ {
					__html: interactionsData,
				} }
			/>
		</Portal>
	);
}

function usePortalContainer() {
	return useListenTo( commandEndEvent( 'editor/documents/attach-preview' ), () => getCanvasIframeDocument()?.head );
}
