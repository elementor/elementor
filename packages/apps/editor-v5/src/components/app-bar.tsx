import * as React from 'react';
import { markSaved } from '@elementor/editor-v5-store';
import { saveDocument } from '@elementor/editor-v5-runtime';
import { __dispatch as dispatch, __useSelector as useSelector } from '@elementor/store';
import { AppBar as UiAppBar, Button, Stack, Toolbar, Typography } from '@elementor/ui';

function getClassicEditorUrl(): string {
	const config = window.ElementorConfig as {
		editorV5?: {
			classicEditorUrl?: string;
		};
	} | undefined;

	return config?.editorV5?.classicEditorUrl ?? '#';
}

function getDocumentTitle(): string {
	const config = window.ElementorConfig as {
		initial_document?: {
			title?: string;
		};
	} | undefined;

	return config?.initial_document?.title ?? 'Editor V5';
}

export default function AppBar() {
	const dirty = useSelector( ( state: { editorV5Document: { dirty: boolean; elements: unknown[] } } ) => state.editorV5Document.dirty );
	const elements = useSelector( ( state: { editorV5Document: { elements: unknown[] } } ) => state.editorV5Document.elements );
	const [ isSaving, setIsSaving ] = React.useState( false );

	const handleSave = async () => {
		setIsSaving( true );

		try {
			await saveDocument( elements );
			dispatch( markSaved() );
		} finally {
			setIsSaving( false );
		}
	};

	return (
		<UiAppBar position="static" color="default" elevation={ 1 }>
			<Toolbar>
				<Stack direction="row" spacing={ 2 } alignItems="center" sx={ { width: '100%' } }>
					<Typography variant="subtitle1" sx={ { flexGrow: 1 } }>
						{ getDocumentTitle() }
						{ dirty ? ' *' : '' }
					</Typography>
					<Button component="a" href={ getClassicEditorUrl() } variant="outlined" size="small">
						Classic Editor
					</Button>
					<Button disabled={ isSaving } onClick={ handleSave } variant="contained" size="small">
						{ isSaving ? 'Saving…' : 'Save' }
					</Button>
				</Stack>
			</Toolbar>
		</UiAppBar>
	);
}
