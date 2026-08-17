import * as React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import {
	__useActiveDocument as useActiveDocument,
	__useActiveDocumentActions as useActiveDocumentActions,
} from '@elementor/editor-documents';
import {
	SaveChangesDialog,
	ThemeProvider,
	useDialog,
} from '@elementor/editor-ui';
import { __ } from '@wordpress/i18n';

import { usePanelActions } from './default-styles-panel';

export const EVENT_REQUEST_OPEN_DEFAULT_STYLES =
	'elementor/default-styles/request-open';

export function DefaultStylesOpenGate() {
	const { open } = usePanelActions();
	const document = useActiveDocument();
	const { save: saveDocument } = useActiveDocumentActions();
	const {
		open: openSaveDialog,
		close: closeSaveDialog,
		isOpen: isSaveDialogOpen,
	} = useDialog();

	const documentRef = useRef( document );
	documentRef.current = document;

	const pendingOpenRef = useRef< ( () => void ) | null >( null );

	const gatedOpen = useCallback(
		( onClean: () => void ) => {
			if ( documentRef.current?.isDirty ) {
				pendingOpenRef.current = onClean;
				openSaveDialog();
				return;
			}

			onClean();
		},
		[ openSaveDialog ]
	);

	const handleSaveAndContinue = useCallback( async () => {
		try {
			await saveDocument();
			closeSaveDialog();
			pendingOpenRef.current?.();
			pendingOpenRef.current = null;
		} catch {
			// Keep dialog open.
		}
	}, [ saveDocument, closeSaveDialog ] );

	const handleStayHere = useCallback( () => {
		closeSaveDialog();
		pendingOpenRef.current = null;
	}, [ closeSaveDialog ] );

	useEffect( () => {
		const handler = () => {
			gatedOpen( () => {
				void open();
			} );
		};

		window.addEventListener( EVENT_REQUEST_OPEN_DEFAULT_STYLES, handler );

		return () => {
			window.removeEventListener(
				EVENT_REQUEST_OPEN_DEFAULT_STYLES,
				handler
			);
		};
	}, [ gatedOpen, open ] );

	if ( ! isSaveDialogOpen ) {
		return null;
	}

	return (
		<ThemeProvider>
			<SaveChangesDialog>
				<SaveChangesDialog.Title>
					{ __( 'You have unsaved changes', 'elementor' ) }
				</SaveChangesDialog.Title>
				<SaveChangesDialog.Content>
					<SaveChangesDialog.ContentText sx={ { mb: 2 } }>
						{ __(
							"To open Default Styles, save your page first. You can't continue without saving.",
							'elementor'
						) }
					</SaveChangesDialog.ContentText>
				</SaveChangesDialog.Content>
				<SaveChangesDialog.Actions
					actions={ {
						cancel: {
							label: __( 'Stay here', 'elementor' ),
							action: handleStayHere,
						},
						confirm: {
							label: __( 'Save & Continue', 'elementor' ),
							action: handleSaveAndContinue,
						},
					} }
				/>
			</SaveChangesDialog>
		</ThemeProvider>
	);
}
