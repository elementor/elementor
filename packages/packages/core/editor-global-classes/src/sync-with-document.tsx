import { useEffect } from 'react';
import {
	__privateListenTo as listenTo,
	isExperimentActive,
	v1ReadyEvent,
} from '@elementor/editor-v1-adapters';

import { usePanelActions } from './components/class-manager/class-manager-panel';
import { syncWithDocumentSave } from './sync-with-document-save';

export function SyncWithDocumentSave() {
	const { open: openClassPanel } = usePanelActions();

	useEffect( () => {
		const unsubscribe = listenTo( v1ReadyEvent(), () => {
			const open = isExperimentActive( 'e_editor_design_system_panel' )
				? () => {
						window.dispatchEvent( new CustomEvent( 'elementor/open-global-classes-manager' ) );
				  }
				: openClassPanel;

			syncWithDocumentSave( { open } );
		} );

		return unsubscribe;

		// eslint-disable-next-line react-hooks/exhaustive-deps -- bind once at v1 ready; openClassPanel from createPanel is stable
	}, [] );

	return null;
}
