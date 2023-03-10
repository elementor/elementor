import { useActiveDocument, useActiveDocumentActions } from '@elementor/documents';
import { Button, CircularProgress, Paper } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export default function PrimaryAction() {
	const document = useActiveDocument();
	const { save } = useActiveDocumentActions();

	return (
		<Paper sx={ {
			px: 5,
			py: 4,
			borderTop: 1,
			borderColor: 'divider',
		} }>
			<Button
				variant="contained"
				disabled={ ! document || ! document.isDirty }
				size="medium"
				sx={ { width: '100%' } }
				onClick={ () => document && ! document.isSaving ? save() : null }
			>
				{
					document?.isSaving
						? <CircularProgress />
						: __( 'Save Changes', 'elementor' )
				}
			</Button>
		</Paper>
	);
}
