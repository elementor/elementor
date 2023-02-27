import { __ } from '@wordpress/i18n';
import { Button, CircularProgress } from '@elementor/ui';
import { Document, useActiveDocument, useActiveDocumentActions } from '@elementor/documents';

export default function PrimaryAction() {
	const document = useActiveDocument();
	const { save } = useActiveDocumentActions();

	if ( ! document ) {
		return null;
	}

	const isDisabled = ! isEnabled( document );

	// When the document is being saved, the spinner should not appear.
	// Usually happens when the Kit is being saved.
	const shouldShowSpinner = document.isSaving && ! isDisabled;

	return (
		<Button
			variant="contained"
			sx={ { width: '120px' } }
			disabled={ isDisabled }
			size="large"
			onClick={ () => ! document.isSaving && save() }
		>
			{
				shouldShowSpinner
					? <CircularProgress />
					: getLabel( document )
			}
		</Button>
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
