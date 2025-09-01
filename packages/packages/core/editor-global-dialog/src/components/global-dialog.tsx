import { useEffect, useState } from 'react';
import * as React from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { Dialog } from '@elementor/ui';

import { subscribe } from '../event-bus';
import { type DialogContent as DialogContentType, EVENT_TYPE } from '../notifier';

export const GlobalDialog = () => {
	const [ content, setContent ] = useState< DialogContentType | null >( null );

	useEffect( () => {
		const unsubOpen = subscribe< DialogContentType >( EVENT_TYPE.OPEN, setContent );
		const unsubClose = subscribe( EVENT_TYPE.CLOSE, () => setContent( null ) );
		return () => {
			unsubOpen();
			unsubClose();
		};
	}, [] );

	if ( ! content ) {
		return null;
	}

	return (
		<ThemeProvider>
			<Dialog open onClose={ () => setContent( null ) } maxWidth="sm" fullWidth>
				{ content.component }
			</Dialog>
		</ThemeProvider>
	);
};
