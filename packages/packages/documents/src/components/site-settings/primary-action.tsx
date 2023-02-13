import { useActiveDocument, useActiveDocumentActions } from '../../hooks';
import { Button, CircularProgress, Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export default function PrimaryAction() {
	const document = useActiveDocument();
	const { save } = useActiveDocumentActions();

	return (
		<Box sx={ {
			position: 'absolute',
			bottom: 0,
			right: 0,
			left: 0,
			px: 5,
			py: 4,
			borderTop: 1,
			borderColor: 'grey.200',
			background: 'white',
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
		</Box>
	);
}
