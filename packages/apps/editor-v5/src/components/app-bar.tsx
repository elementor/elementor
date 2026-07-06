import * as React from 'react';
import { useState } from 'react';
import { saveDocument } from '@elementor/editor-v5-runtime';
import { markSaved, type ElementNode } from '@elementor/editor-v5-store';
import { __dispatch as dispatch, __useSelector as useSelector } from '@elementor/store';
import { AppBar as UiAppBar, Alert, Box, Button, Chip, Snackbar, Stack, Toolbar, Typography } from '@elementor/ui';

import { getClassicEditorUrl, getDocumentTitle } from '../editor-config';

export default function AppBar() {
	const dirty = useSelector(
		( state: { editorV5Document: { dirty: boolean; elements: unknown[] } } ) => state.editorV5Document.dirty
	);
	const elements = useSelector(
		( state: { editorV5Document: { elements: ElementNode[] } } ) => state.editorV5Document.elements
	);
	const [ isSaving, setIsSaving ] = useState( false );
	const [ saveMessage, setSaveMessage ] = useState< string | null >( null );
	const [ saveError, setSaveError ] = useState< string | null >( null );

	const handleSave = async () => {
		setIsSaving( true );
		setSaveError( null );
		setSaveMessage( null );

		try {
			await saveDocument( elements );
			dispatch( markSaved() );
			setSaveMessage( 'Page saved. Reload to verify persisted preview.' );
		} catch ( error ) {
			setSaveError( error instanceof Error ? error.message : 'Save failed.' );
		} finally {
			setIsSaving( false );
		}
	};

	return (
		<>
			<UiAppBar
				position="static"
				sx={ {
					backgroundColor: 'background.paper',
					borderBottom: '1px solid',
					borderColor: 'divider',
					color: 'text.primary',
				} }
			>
				<Toolbar>
					<Stack direction="row" spacing={ 2 } alignItems="center" sx={ { width: '100%' } }>
						<Box sx={ { flexGrow: 1 } }>
							<Stack alignItems="center" direction="row" spacing={ 1 }>
								<Typography sx={ { fontWeight: 600 } } variant="subtitle1">
									{ getDocumentTitle() }
								</Typography>
								<Chip
									color={ dirty ? 'warning' : 'default' }
									label={ dirty ? 'Unsaved' : 'Saved' }
									size="small"
								/>
								<Chip label="Editor V5 POC" size="small" variant="outlined" />
							</Stack>
						</Box>
						<Button component="a" href={ getClassicEditorUrl() } variant="outlined" size="small">
							Classic Editor
						</Button>
						<Button disabled={ isSaving } onClick={ handleSave } variant="contained" size="small">
							{ isSaving ? 'Saving…' : 'Save' }
						</Button>
					</Stack>
				</Toolbar>
			</UiAppBar>
			<Snackbar autoHideDuration={ 4000 } onClose={ () => setSaveMessage( null ) } open={ Boolean( saveMessage ) }>
				<Alert severity="success" sx={ { width: '100%' } }>
					{ saveMessage }
				</Alert>
			</Snackbar>
			<Snackbar autoHideDuration={ 6000 } onClose={ () => setSaveError( null ) } open={ Boolean( saveError ) }>
				<Alert severity="error" sx={ { width: '100%' } }>
					{ saveError }
				</Alert>
			</Snackbar>
		</>
	);
}
