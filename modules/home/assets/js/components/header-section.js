import { Paper, Stack } from '@elementor/ui';
import Typography from '@elementor/ui/Typography';
import Button from '@elementor/ui/Button';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';

const SITE_PLANNER_LOCAL_ORIGIN = 'http://localhost:5000';

const createSitePlannerOverlay = ( jwt ) => {
	const overlay = document.createElement( 'div' );
	overlay.id = 'e-site-planner-overlay';
	Object.assign( overlay.style, {
		position: 'fixed',
		top: '0',
		left: '0',
		width: '100vw',
		height: '100vh',
		background: 'rgba(0, 0, 0, 0.6)',
		zIndex: '100000',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	} );

	const origin = SITE_PLANNER_LOCAL_ORIGIN;

	const iframePath = '/website-planner/chat';
	const iframeUrl = new URL( origin + iframePath );
	iframeUrl.searchParams.set( 'colorScheme', 'light' );
	iframeUrl.searchParams.set( 'origin', window.location.origin );
	iframeUrl.searchParams.set( 'instanceId', 'site-planner-home-' + Math.random().toString( 36 ).substring( 7 ) );
	iframeUrl.searchParams.set( 'ver', Date.now().toString() );

	const iframe = document.createElement( 'iframe' );
	Object.assign( iframe.style, {
		width: '100%',
		height: '100%',
		border: 'none',
		backgroundColor: '#fff',
	} );
	iframe.setAttribute( 'allow', 'clipboard-read; clipboard-write' );
	iframe.src = iframeUrl.href;

	overlay.appendChild( iframe );
	document.body.appendChild( overlay );

	const instanceId = iframeUrl.searchParams.get( 'instanceId' );

	const onMessage = ( event ) => {
		console.log('event', event);
		if ( event.origin !== iframeUrl.origin ) {
			return;
		}
		if ( event.data.type === 'get/referrer/info' ) {
			iframe.contentWindow.postMessage( {
				type: 'referrer/info',
				instanceId: event.data.payload?.instanceId || instanceId,
				info: {
					page: {
						url: window.location.href,
						editorSessionId: 'home-screen',
						elementorAiCurrentContext: {},
						bodyStyle: {},
					},
					authToken: jwt || '',
					products: {
						core: { version: elementorCommon?.config?.version || '' },
						pro: { isPro: false },
						ai: { config: {} },
					},
					user: {
						isAdmin: true,
					},
				},
			}, iframeUrl.origin );
		}
		if ( event.data.type === 'site-planner/close' || event.data.type === 'element-selector/close' ) {
			overlay.remove();
			window.removeEventListener( 'message', onMessage );
		}
	};

	window.addEventListener( 'message', onMessage );
	overlay.addEventListener( 'click', ( e ) => {
		if ( e.target === overlay ) {
			overlay.remove();
			window.removeEventListener( 'message', onMessage );
		}
	} );
};

const openSitePlannerModal = () => {
	elementorCommon.ajax.addRequest( 'ai_get_remote_config', {
		success: ( res ) => {
			const jwt = res?.config?.jwt;
			console.log('res', res);
			if ( ! jwt ) {
				// eslint-disable-next-line no-alert
				alert( 'No JWT returned from ai_get_remote_config. Make sure you are connected to a staging account with AI.' );
				return;
			}
			createSitePlannerOverlay( jwt );
		},
		error: ( err ) => {
			// eslint-disable-next-line no-alert
			alert( 'Failed to get remote config: ' + JSON.stringify( err ) );
		},
	} );
};

const HeaderSection = ( props ) => {
	return (
		<Paper
			elevation={ 0 }
			sx={ {
				display: 'flex',
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
				pt: 2.5,
			} }
		>
			<Typography variant="h5">
				{ __( 'Quick Start', 'elementor' ) }
			</Typography>
			<Stack direction="row" spacing={ 1 }>
				<Button
					variant="outlined"
					size="medium"
					color="info"
					startIcon={ <span className="eicon-ai"></span> }
					onClick={ openSitePlannerModal }
				>
					{ __( 'Open Site Planner', 'elementor' ) }
				</Button>
				<Button
					variant="contained"
					size="medium"
					color="primary"
					href={ props.editWebsiteUrl }
					target="_blank"
					rel="noopener noreferrer"
				>
					{ __( 'Edit site', 'elementor' ) }
				</Button>
			</Stack>
		</Paper>
	);
};

HeaderSection.propTypes = {
	editWebsiteUrl: PropTypes.string.isRequired,
};

export default HeaderSection;
