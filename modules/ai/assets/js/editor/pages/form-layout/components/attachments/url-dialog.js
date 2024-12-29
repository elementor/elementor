import { Dialog, Typography } from '@elementor/ui';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { AlertDialog } from '../../../../components/alert-dialog';
import { useTimeout } from '../../../../hooks/use-timeout';
import { USER_URL_SOURCE } from '../attachments';
import { CONFIG_KEYS, useRemoteConfig } from '../../context/remote-config';
import useUserInfo from '../../../../hooks/use-user-info';
import { useRequestIds } from '../../../../context/requests-ids';

export const UrlDialog = ( props ) => {
	const [ isTimeout, turnOffTimeout ] = useTimeout( 10_000 );
	const {
		isLoading,
		usagePercentage: initialUsagePercentage,
	} = useUserInfo();
	const { updateUsagePercentage } = useRequestIds();
	const [ isInitUsageDone, setIsInitUsageDone ] = useState( false );

	const { remoteConfig } = useRemoteConfig();
	const builderUrl = remoteConfig[ CONFIG_KEYS.WEB_BASED_BUILDER_URL ];
	const urlObject = builderUrl ? new URL( builderUrl ) : {};
	const iframeOrigin = urlObject.origin;
	const isOpen = useRef( false );

	useEffect( () => {
		if ( ! isInitUsageDone && ! isLoading && ( initialUsagePercentage || 0 === initialUsagePercentage ) ) {
			updateUsagePercentage( initialUsagePercentage );
			setIsInitUsageDone( true );
		}
	}, [ isLoading, initialUsagePercentage, isInitUsageDone, updateUsagePercentage ] );

	useEffect( () => {
		if ( ! isOpen.current ) {
			try {
				window.$e.run( 'ai-integration/open-choose-element', {
					url: props.url,
				} );
				isOpen.current = true;
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( error );
			}
		}
	}, [ isOpen.current ] );

	useEffect( () => {
		const onMessage = ( event ) => {
			if ( event.origin !== iframeOrigin ) {
				return;
			}

			const { type, html, url } = event.data;

			switch ( type ) {
				case 'element-selector/close':
					isOpen.current = false;
					props.onClose();
					break;
				case 'element-selector/loaded':
					turnOffTimeout();
					isOpen.current = true;
					break;
				case 'element-selector/attach':
					props.onAttach( [ {
						type: 'url',
						previewHTML: html,
						content: html,
						label: url ? new URL( url ).href : '',
						source: USER_URL_SOURCE,
					} ] );
					break;
			}
		};

		window.addEventListener( 'message', onMessage );

		return () => {
			window.removeEventListener( 'message', onMessage );
		};
	}, [ iframeOrigin, props, turnOffTimeout ] );

	return (
		<>
			{
				! isOpen.current && ! isTimeout && <Dialog
					open={ true }
					maxWidth="lg"
				>
					<Typography
						sx={ {
							textAlign: 'center',
							padding: 3,
						} }
					>
						{ __( 'Loading...', 'elementor' ) }
					</Typography>
				</Dialog>
			}
			{
				isTimeout && <AlertDialog
					message={ __( 'The app is not responding. Please try again later. (#408)', 'elementor' ) }
					onClose={ props.onClose }
				/>
			}
		</>
	);
};

UrlDialog.propTypes = {
	onAttach: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
	url: PropTypes.string,
};
