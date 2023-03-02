import { Stack } from '@elementor/ui';
import { useActiveDocument, useHostDocument } from '@elementor/documents';
import SettingsButton from './settings-button';
import Indicator from './indicator';

export default function CanvasDisplay() {
	const activeDocument = useActiveDocument();
	const hostDocument = useHostDocument();

	const document = activeDocument && activeDocument.type.value !== 'kit'
		? activeDocument
		: hostDocument;

	if ( ! document ) {
		return null;
	}

	return (
		<Stack direction="row" spacing={ 3 } sx={ { paddingInlineStart: 3, cursor: 'default' } }>
			<Indicator title={ document.title } status={ document.status } />
			<SettingsButton type={ document.type } />
		</Stack>
	);
}
