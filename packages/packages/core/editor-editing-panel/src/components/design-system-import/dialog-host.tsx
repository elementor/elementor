import * as React from 'react';
import { useSyncExternalStore } from 'react';
import { ThemeProvider } from '@elementor/editor-ui';

import { ImportDesignSystemDialog } from './import-design-system-dialog';
import { ImportResultsDialog } from './import-results-dialog';
import { importDialogState } from './state';

export const DialogHost = () => {
	const { isOpen, isResultsOpen, lastResult } = useSyncExternalStore(
		importDialogState.subscribe,
		importDialogState.getSnapshot
	);

	if ( ! isOpen && ! isResultsOpen ) {
		return null;
	}

	return (
		<ThemeProvider>
			{ isOpen && <ImportDesignSystemDialog open onClose={ importDialogState.close } /> }
			{ isResultsOpen && (
				<ImportResultsDialog open result={ lastResult } onClose={ importDialogState.closeResults } />
			) }
		</ThemeProvider>
	);
};
