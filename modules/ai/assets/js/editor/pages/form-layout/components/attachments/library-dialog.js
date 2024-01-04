import { Dialog, DialogContent } from '@elementor/ui';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { useAttachUrlService } from '../../hooks/use-attach-url-service';
import { AlertDialog } from '../../../../components/alert-dialog';
import { useTimeout } from '../../../../hooks/use-timeout';
import { ATTACHMENT_TYPE_JSON, ATTACHMENT_TYPE_LIBRARY } from '../attachments';

export const LibraryDialog = ( props ) => {
	useEffect( () => {
		const onMessage = ( event ) => {
			const { type, json, html, label } = event.data;

			switch ( type ) {
				case 'element-selector/close':
					props.onClose();
					break;
				case 'element-selector/attach':
					props.onAttach( [ {
						type: ATTACHMENT_TYPE_JSON,
						previewHTML: html,
						content: json,
						label,
					} ] );
					break;
			}
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
	onClose: PropTypes.func.isRequired,
	url: PropTypes.string,
};
