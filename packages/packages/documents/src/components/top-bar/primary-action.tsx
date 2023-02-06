import { __ } from '@wordpress/i18n';
import { Document } from '../../types';
import { Button, CircularProgress } from '@elementor/ui';
import { useActiveDocument, useActiveDocumentActions } from '../../hooks';

export default function PrimaryAction() {
	const document = useActiveDocument();
	const { save } = useActiveDocumentActions();

	if ( ! document ) {
		return null;
	}

	const isDisabled = ! isEnabled( document );
	const shouldShowSpinner = document.isSaving && ! isDisabled;

	return (
		<Button variant="contained"
			disabled={ isDisabled }
			size="large"
			startIcon={ shouldShowSpinner && <CircularProgress /> }
			onClick={ () => {
				if ( document.isSaving ) {
					return;
				}

				save();
			} }
		>
			{ getLabel( document ) }
		</Button>
	);
}

function getLabel( document: Document ) {
	if ( ! document.userCan.publish ) {
		return __( 'Submit', 'elementor' );
	}

	return __( 'Publish', 'elementor' );
}

function isEnabled( document: Document ) {
	if ( document.type === 'kit' ) {
		return false;
	}

	return document.isDirty || document.status === 'draft';
}
