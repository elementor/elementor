import { useEffect, useState } from 'react';
import * as React from 'react';
import { Dialog } from '@elementor/ui';

import ThemeProvider from '../../theme-provider';
import { closeDialog, subscribeToDialogState } from '../subscribers';
import { type DialogContent } from '../subscribers';

export const GlobalDialog = () => {
	const [ content, setContent ] = useState< DialogContent | null >( null );

	useEffect( () => {
		const unsubscribe = subscribeToDialogState( setContent );
		return () => {
			unsubscribe();
		};
	}, [] );

	if ( ! content ) {
		return null;
	}

	return (
		<ThemeProvider>
			<Dialog role="dialog" open onClose={ closeDialog } maxWidth="sm" fullWidth>
				{ content.component }
			</Dialog>
		</ThemeProvider>
	);
};
