import { useActiveDocument } from '../hooks';
import { Box } from '@elementor/ui';

export default function TopBarIndicator() {
	const document = useActiveDocument();

	if ( ! document ) {
		return null;
	}

	return (
		<Box sx={ { px: 3 } }>
			{ document.isDirty && '[*] ' }
			{ document.title }
			{ document.isSaving && ' [Saving...] ' }
			{ document.isSavingDraft && ' [Saving Draft...] ' } ({ document.status })
		</Box>
	);
}
