import { useEffect, useState } from 'react';
import * as React from 'react';
import { Dialog } from '@elementor/ui';

import { subscribeToDialogState } from '../event-bus';
import { type DialogContent as DialogContentType } from '../event-bus';

export const GlobalDialog = () => {
	const [ content, setContent ] = useState< DialogContentType | null >( null );

	useEffect( () => {
		const subscription = subscribeToDialogState( setContent );
		return () => {
			subscription();
		};
	}, [] );

	if ( ! content ) {
		return null;
	}

	return (
		<Dialog open onClose={ () => setContent( null ) } maxWidth="sm" fullWidth>
			{ content.component }
		</Dialog>
	);
};
