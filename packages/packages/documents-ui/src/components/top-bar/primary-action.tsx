import * as React from 'react';
import { __ } from '@wordpress/i18n';
import PrimaryActionMenu from './primary-action-menu';
import {
	bindMenu,
	bindTrigger,
	Button,
	ButtonGroup,
	CircularProgress,
	Tooltip,
	usePopupState,
} from '@elementor/ui';
import { Document, useActiveDocument, useActiveDocumentActions } from '@elementor/documents';
import { ChevronDownIcon } from '@elementor/icons';

export default function PrimaryAction() {
	const document = useActiveDocument();
	const { save } = useActiveDocumentActions();

	const popupState = usePopupState( {
		variant: 'popover',
		popupId: 'document-save-options',
	} );

	if ( ! document ) {
		return null;
	}

	const isDisabled = ! isEnabled( document );

	// When the document is being saved, the spinner should not appear.
	// Usually happens when the Kit is being saved.
	const shouldShowSpinner = document.isSaving && ! isDisabled;

	return (
		<>
			<ButtonGroup size="large" variant="contained">
				<Button
					onClick={ () => ! document.isSaving && save() }
					sx={ { width: '120px' } }
					disabled={ isDisabled }
				>
					{ shouldShowSpinner ? <CircularProgress /> : getLabel( document ) }
				</Button>

				<Tooltip
					title={ __( 'Save Options', 'elementor' ) }
					PopperProps={ {
						sx: {
							'&.MuiTooltip-popper .MuiTooltip-tooltip.MuiTooltip-tooltipPlacementBottom': {
								mt: 3,
								mr: 1,
							},
						},
					} }
				>
					<Button sx={ { px: 0 } } { ...bindTrigger( popupState ) }>
						<ChevronDownIcon />
					</Button>
				</Tooltip>
			</ButtonGroup>
			<PrimaryActionMenu { ...bindMenu( popupState ) } onClick={ popupState.close } />
		</>
	);
}

function getLabel( document: Document ) {
	return document.userCan.publish
		? __( 'Publish', 'elementor' )
		: __( 'Submit', 'elementor' );
}

function isEnabled( document: Document ) {
	if ( document.type.value === 'kit' ) {
		return false;
	}

	return document.isDirty || document.status.value === 'draft';
}
