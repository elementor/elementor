import { useEffect, useState } from 'react';
import { UrlDialog } from './url-dialog';
import { Thumbnail } from './thumbnail';
import { useAttachUrlService } from '../../hooks/use-attach-url-service';
import { attachmentsShape } from '../../../../types/attachments';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

const MODE_SELECT = 'select';
const MODE_THUMBNAIL = 'thumbnail';

export const AttachmentUrl = ( props ) => {
	const initialAttachment = props.attachments?.find( ( item ) => 'url' === item.type );

	const [ mode, setMode ] = useState( initialAttachment ? MODE_THUMBNAIL : MODE_SELECT );
	const [ attachmentHTML, setAttachmentHTML ] = useState( initialAttachment ? initialAttachment.previewHTML : '' );
	const { iframeSource, setCurrentUrl } = useAttachUrlService();
	const [ isIframeLoaded, setIsIframeLoaded ] = useState( false );

	useEffect( () => {
		const onMessage = ( event ) => {
			const { type, html, url } = event.data;

			if ( 'element-selector/loaded' === type ) {
				setIsIframeLoaded( true );
			}

			if ( 'element-selector/close' === type ) {
				if ( attachmentHTML ) {
					setMode( MODE_THUMBNAIL );
				} else {
					props.onDetach();
				}
			}

			if ( 'element-selector/attach' === type ) {
				const host = new URL( url ).host;

				props.onAttach( [ {
					type: 'url',
					previewHTML: html,
					content: html,
					label: host,
				} ] );
				setCurrentUrl( url );
				setAttachmentHTML( html );
				setMode( MODE_THUMBNAIL );
			}
		};

		window.addEventListener( 'message', onMessage );

		return () => {
			window.removeEventListener( 'message', onMessage );
		};
	}, [ attachmentHTML ] );

	useEffect( () => {
		const timeout = setTimeout( () => {
			if ( ! isIframeLoaded ) {
				props.onDetach();
				window.alert( __( 'Cannot load the app. Please try again later.' ) );
			}
		}, 4000 );

		return () => {
			clearTimeout( timeout );
		};
	}, [ isIframeLoaded ] );

	if ( MODE_THUMBNAIL === mode ) {
		return (
			<Thumbnail
				disabled={ props.disabled }
				html={ attachmentHTML }
				onClick={ () => {
					setMode( MODE_SELECT );
				} }
				allowRemove={ true }
				onRemove={ ( event ) => {
					event.stopPropagation();
					setAttachmentHTML( '' );
					setCurrentUrl( '' );
					props.onDetach();
				} }
			/>
		);
	}

	return (
		<UrlDialog
			title={ __( 'URL as a reference' ) }
			iframeSource={ iframeSource }
		/>
	);
};

AttachmentUrl.propTypes = {
	attachments: attachmentsShape,
	onAttach: PropTypes.func,
	onDetach: PropTypes.func,
	disabled: PropTypes.bool,
};

export default AttachmentUrl;
