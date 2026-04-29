import * as React from 'react';
import { useSyncExternalStore } from 'react';
import { ThemeProvider } from '@elementor/editor-ui';

import { ImportDesignSystemDialog } from './import-design-system-dialog';
import { importDialogState } from './state';

export const DialogHost = () => {
	const { isOpen } = useSyncExternalStore( importDialogState.subscribe, importDialogState.getSnapshot );

	if ( ! isOpen ) {
		return null;
	}

	return (
		<ThemeProvider>
			<ImportDesignSystemDialog open onClose={ importDialogState.close } />
		</ThemeProvider>
	);
};
