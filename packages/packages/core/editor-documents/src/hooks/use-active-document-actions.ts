import { useCallback } from 'react';
import { __privateOpenRoute as openRoute, __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

import useActiveDocument from './use-active-document';

export default function useActiveDocumentActions() {
	const document = useActiveDocument();

	const permalink = document?.links?.permalink ?? '';

	const save = useCallback( () => runCommand( 'document/save/default' ), [] );

	const saveDraft = useCallback( () => runCommand( 'document/save/draft' ), [] );

	const saveTemplate = useCallback( () => openRoute( 'library/save-template' ), [] );

	const copyAndShare = useCallback( () => {
		navigator.clipboard.writeText( permalink );
	}, [ permalink ] );

	return {
		save,
		saveDraft,
		saveTemplate,
		copyAndShare,
	};
}
