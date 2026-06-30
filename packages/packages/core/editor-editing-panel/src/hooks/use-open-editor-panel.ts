import { useEffect } from 'react';
import { __privateListenTo as listenTo, commandStartEvent } from '@elementor/editor-v1-adapters';

import { usePanelActions } from '../panel';
import { isAtomicWidgetSelected } from '../sync/is-atomic-widget-selected';

export const useOpenEditorPanel = () => {
	const { open } = usePanelActions();

	useEffect( () => {
		return listenTo( commandStartEvent( 'panel/editor/open' ), () => {
			if ( isAtomicWidgetSelected() ) {
				open();
			}
		} );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps
};
