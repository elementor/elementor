import { useActiveDocument, useActiveDocumentActions } from '../hooks';
import { Button } from '@elementor/ui';

export default function TopBarSave() {
	const document = useActiveDocument();
	const { save } = useActiveDocumentActions();

	return (
		<Button variant="contained"
			onClick={ () => save() }
			disabled={ ! document || ! document.isDirty }
			size="large"
			sx={ {
				position: 'absolute',
				right: 0,
			} }
		>
			Publish
		</Button>
	);
}
