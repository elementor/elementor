import { Dialog, DialogContent } from '@elementor/ui';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { useAttachUrlService } from '../../hooks/use-attach-url-service';
import { AlertDialog } from '../../../../components/alert-dialog';
import { useTimeout } from '../../../../hooks/use-timeout';

export const UrlDialog = ( props ) => {
	const { iframeSource } = useAttachUrlService();
	const [ isTimeout, turnOffTimeout ] = useTimeout( 10_000 );

	useEffect( () => {
		const onMessage = ( event ) => {
			const { type, html, url } = event.data;

			if ( 'element-selector/loaded' === type ) {
				turnOffTimeout();
			}

			if ( 'element-selector/attach' === type ) {
				const host = new URL( url ).host;

				props.onAttach( [ {
					type: 'url',
					previewHTML: html,
					content: html,
					label: host,
				} ] );
			}
		};

		window.addEventListener( 'message', onMessage );

		return () => {
			window.removeEventListener( 'message', onMessage );
		};
	}, [ turnOffTimeout ] );

	return (
		<Dialog
			open={ true }
			fullScreen={ true }
			hideBackdrop={ true }
			maxWidth="md"
			sx={ {
				'& .MuiPaper-root': {
					backgroundColor: 'transparent',
				},
			} }
		>
			<DialogContent
				sx={ {
					padding: 0,
				} }
			>
				{
					isTimeout && <AlertDialog
						message={ __( 'The app is not responding. Please try again later.', 'elementor' ) }
						onClose={ props.onClose }
					/>
				}

				{
					! isTimeout && (
						<iframe
							title={ __( 'URL as a reference', 'elementor' ) }
							src={ iframeSource }
							style={ {
								border: 'none',
								overflow: 'scroll',
								width: '100%',
								height: '100%',
								backgroundColor: 'rgba(255,255,255,0.6)',
							} }
						/>
					) }
			</DialogContent>
		</Dialog>
	);
};

UrlDialog.propTypes = {
	onAttach: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
};
