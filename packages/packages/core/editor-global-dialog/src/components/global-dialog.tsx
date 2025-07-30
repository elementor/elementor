import * as React from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { __useDispatch as useDispatch, __useSelector as useSelector } from '@elementor/store';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@elementor/ui';

import { close, resolveDialog, SLICE_NAME } from '../slice';
import { type DialogData } from '../types';

export const GlobalDialog = () => {
	const dispatch = useDispatch();
	const dialog = useSelector(
		( state: { [ SLICE_NAME ]: { activeDialog: DialogData | null } } ) => state[ SLICE_NAME ]?.activeDialog
	);

	if ( ! dialog ) {
		return null;
	}

	const { title, content, actions = [] } = dialog;

	const handleClose = () => dispatch( close() );

	return (
		<ThemeProvider>
			<Dialog open id={ 'global-dialog' } onClose={ handleClose }>
				<DialogTitle>{ title }</DialogTitle>
				<DialogContent>{ content }</DialogContent>
				<DialogActions>
					{ actions.map( ( { text, type = 'primary', value }, index ) => (
						<Button
							key={ index }
							variant={ type === 'primary' ? 'contained' : 'text' }
							color="secondary"
							onClick={ () => resolveDialog( value ) }
						>
							{ text }
						</Button>
					) ) }
				</DialogActions>
			</Dialog>
		</ThemeProvider>
	);
};
