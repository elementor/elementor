import { useCallback } from 'react';
import { openRoute, runCommand } from '@elementor/v1-adapters';

export default function useActiveDocumentActions() {
	const save = useCallback( () => runCommand( 'document/save/default' ), [] );

	const saveDraft = useCallback( () => runCommand( 'document/save/draft' ), [] );

	const saveTemplate = useCallback( () => openRoute( 'library/save-template' ), [] );

	return {
		save,
		saveDraft,
		saveTemplate,
	};
}
