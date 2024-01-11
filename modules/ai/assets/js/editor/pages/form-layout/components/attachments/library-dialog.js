import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { ATTACHMENT_TYPE_JSON } from '../attachments';

export const ELEMENTOR_LIBRARY = 'elementor-library';

export const LibraryDialog = ( props ) => {
	useEffect( () => {
		const onMessage = ( event ) => {
			const { type, json, html, label, source } = event.data;

			if ( 'library/attach' !== type ) {
				return;
			}
			props.onAttach( [ {
				type: ATTACHMENT_TYPE_JSON,
				previewHTML: html,
				content: json,
				label,
				source,
			} ] );
		};

		window.addEventListener( 'message', onMessage );

		return () => {
			window.removeEventListener( 'message', onMessage );
		};
	} );
	$e.run( 'library/open', { toDefault: true, mode: 'ai-attachment' } );
	return null;
};

LibraryDialog.propTypes = {
	onAttach: PropTypes.func.isRequired,
};
