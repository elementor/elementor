import { useEffect } from 'react';
import { __ } from '@wordpress/i18n';

import useActiveDocument from './use-active-document';
import useHostDocument from './use-host-document';

export default function useSyncDocumentTitle() {
	const activeDocument = useActiveDocument();
	const hostDocument = useHostDocument();

	const document = activeDocument && activeDocument.type.value !== 'kit' ? activeDocument : hostDocument;

	useEffect( () => {
		// Allow empty string as title.
		if ( document?.title === undefined ) {
			return;
		}

		// translators: %s: Document title.
		const title = __( 'Edit "%s" with Elementor', 'elementor' ).replace( '%s', document.title );

		window.document.title = title;
	}, [ document?.title ] );
}
