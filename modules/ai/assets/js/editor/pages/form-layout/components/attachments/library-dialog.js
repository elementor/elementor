import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { ATTACHMENT_TYPE_JSON } from '../attachments';

export const LibraryDialog = ( props ) => {
	const isApplyingTemplate = useRef( false );

	useEffect( () => {
		const onLibraryHide = ( ) => {
			if ( isApplyingTemplate.current ) {
				return;
			}
			props.onClose();
		};

		$e.components.get( 'library' ).layout.getModal().on( 'hide', onLibraryHide );

		return () => {
			$e.components.get( 'library' ).layout.getModal().off( 'hide', onLibraryHide );
		};
	}, [ props ] );

	useEffect( () => {
		const onMessage = ( event ) => {
			const { type, json, html, label, source } = event.data;

			switch ( type ) {
				case 'library/attach:start':
					isApplyingTemplate.current = true;
					break;
				case 'library/attach':
					props.onAttach( [ {
						type: ATTACHMENT_TYPE_JSON,
						previewHTML: html,
						content: json,
						label,
						source,
					} ] );
					isApplyingTemplate.current = false;
					props.onClose();
					break;
			}
		};

		window.addEventListener( 'message', onMessage );

		return () => {
			window.removeEventListener( 'message', onMessage );
		};
	} );
	$e.run( 'library/open', { toDefault: true, mode: 'ai-attachment' } );
	isApplyingTemplate.current = false;
	return null;
};

LibraryDialog.propTypes = {
	onAttach: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
};
