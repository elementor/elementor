import * as React from 'react';
import {
	__useActiveDocument as useActiveDocument,
	__useActiveDocumentActions as useActiveDocumentActions,
	type Document,
} from '@elementor/editor-documents';
import { useEditMode } from '@elementor/editor-v1-adapters';
import { ChevronDownIcon } from '@elementor/icons';
import {
	bindMenu,
	bindTrigger,
	Box,
	Button,
	ButtonGroup,
	CircularProgress,
	Tooltip,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type ExtendedWindow } from '../../../types';
import PrimaryActionMenu from './primary-action-menu';

export default function PrimaryAction() {
	const document = useActiveDocument();
	const { save } = useActiveDocumentActions();
	const editMode = useEditMode();

	const isEditMode = editMode === 'edit';

	const popupState = usePopupState( {
		variant: 'popover',
		popupId: 'document-save-options',
	} );

	if ( ! document ) {
		return null;
	}

	const isPublishDisabled = ! isEditMode || ! isPublishEnabled( document );
	const isSaveOptionsDisabled = ! isEditMode || document.type.value === 'kit';

	// When the document is being saved, the spinner should not appear.
	// Usually happens when the Kit is being saved.
	const shouldShowSpinner = document.isSaving && ! isPublishDisabled;

	return (
		<>
			<ButtonGroup size="large" variant="contained">
				<Button
					onClick={ () => {
						const extendedWindow = window as unknown as ExtendedWindow;
						const config = extendedWindow?.elementor?.editorEvents?.config;

						if ( config ) {
							extendedWindow.elementor.editorEvents.dispatchEvent( config.names.topBar.publishButton, {
								location: config.locations.topBar,
								secondaryLocation: config.secondaryLocations[ 'publish-button' ],
								trigger: config.triggers.click,
								element: config.elements.mainCta,
							} );
						}

						if ( ! document.isSaving ) {
							save();
						}
					} }
					sx={ {
						height: '100%',
						borderRadius: 0,
						maxWidth: '158px',
						'&.MuiButtonBase-root.MuiButtonGroup-grouped': {
							minWidth: '110px',
						},
					} }
					disabled={ isPublishDisabled }
				>
					{ shouldShowSpinner ? <CircularProgress color="inherit" size="1.5em" /> : getLabel( document ) }
				</Button>

				<Tooltip
					title={ __( 'Save Options', 'elementor' ) }
					PopperProps={ {
						sx: {
							'&.MuiTooltip-popper .MuiTooltip-tooltip.MuiTooltip-tooltipPlacementBottom': {
								mt: 1,
								mr: 0.25,
							},
						},
					} }
				>
					<Box component="span" aria-label={ undefined }>
						<Button
							size="small"
							{ ...bindTrigger( popupState ) }
							sx={ { px: 0, height: '100%', borderRadius: 0 } }
							disabled={ isSaveOptionsDisabled }
							aria-label={ __( 'Save Options', 'elementor' ) }
						>
							<ChevronDownIcon />
						</Button>
					</Box>
				</Tooltip>
			</ButtonGroup>
			<PrimaryActionMenu { ...bindMenu( popupState ) } onClick={ popupState.close } />
		</>
	);
}

function getLabel( document: Document ) {
	return document.userCan.publish ? __( 'Publish', 'elementor' ) : __( 'Submit', 'elementor' );
}

function isPublishEnabled( document: Document ) {
	if ( document.type.value === 'kit' ) {
		return false;
	}

	return document.isDirty || document.status.value === 'draft';
}
