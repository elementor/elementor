import { useCallback } from 'react';
import { openRoute, runCommand } from '@elementor/v1-adapters';

export default function useCurrentDocumentActions() {
	const save = useCallback( () => {
		return runCommand( 'document/save/default' );
	}, [] );

	const saveDraft = useCallback( () => {
		return runCommand( 'document/save/draft' );
	}, [] );

	const saveTemplate = useCallback( () => {
		return openRoute( 'library/save-template' );
	}, [] );

	return {
		save,
		saveDraft,
		saveTemplate,
	};
}
