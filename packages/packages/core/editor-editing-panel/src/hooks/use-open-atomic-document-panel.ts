import { useEffect } from 'react';
import { __privateListenTo as listenTo, commandStartEvent } from '@elementor/editor-v1-adapters';

import { useAtomicDocumentPanelActions } from '../panel-atomic-document';
import { isAtomicDocumentOpen } from '../sync/is-atomic-document-open';

export const useOpenAtomicDocumentPanel = () => {
	const { open } = useAtomicDocumentPanelActions();

	useEffect( () => {
		return listenTo( commandStartEvent( 'panel/page-settings/style' ), () => {
			if ( isAtomicDocumentOpen() ) {
				open();
			}
		} );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps
};
