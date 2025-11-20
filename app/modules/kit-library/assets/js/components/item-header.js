import KitDialog from './kit-dialog';
import ConnectDialog from './connect-dialog';
import Header from './layout/header';
import HeaderBackButton from './layout/header-back-button';
import Kit from '../models/kit';
import useDownloadLinkMutation from '../hooks/use-download-link-mutation';
import useKitCallToAction, {
	TYPE_PROMOTION,
	TYPE_CONNECT,
} from '../hooks/use-kit-call-to-action';
import useAddKitPromotionUTM from '../hooks/use-add-kit-promotion-utm';
import { Dialog } from '@elementor/app-ui';
import { useMemo, useState } from 'react';
import { useSettingsContext } from '../context/settings-context';
import { isTierAtLeast, TIERS } from 'elementor-utils/tiers';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';
import { useTracking } from '../context/tracking-context';

import './item-header.scss';

/**
 * Returns the right call to action button.
 *
 * @param {Kit}      model
 * @param {Object}   root0
 * @param {Function} root0.apply
 * @param {Function} root0.onConnect
 * @param {Function} root0.onClick
 * @param {boolean}  root0.isApplyLoading
 * @param {Function} root0.onUpgrade
 * @return {Object} result
 */
function useKitCallToActionButton(
	model,
	{ apply, isApplyLoading, onConnect, onClick, onUpgrade = () => {} },
) {
	const { type, subscriptionPlan } = useKitCallToAction( model.accessTier );
	const promotionUrl = useAddKitPromotionUTM(
		subscriptionPlan.promotion_url,
		model.id,
		model.title,
	);
	const { settings } = useSettingsContext();

	return useMemo( () => {
		if ( type === TYPE_CONNECT ) {
			return {
				id: 'connect',
				text: __( 'Apply', 'elementor' ), // The label is Apply kit but the this is connect button
				hideText: false,
				variant: 'contained',
				color: 'primary',
				size: 'sm',
				onClick: ( e ) => {
					onConnect( e );
					onClick?.( e );
				},
				includeHeaderBtnClass: false,
			};
		}

		if ( type === TYPE_PROMOTION && subscriptionPlan ) {
			return {
				id: 'promotion',
				text: settings.is_pro ? 'Upgrade' : `Go ${ subscriptionPlan.label }`,
				hideText: false,
				variant: 'contained',
				color: 'cta',
				size: 'sm',
				url: promotionUrl,
				target: '_blank',
				onClick: ( e ) => {
					onUpgrade?.( e );
				},
				includeHeaderBtnClass: false,
			};
		}

		return {
			id: 'apply',
			text: __( 'Apply', 'elementor' ),
			className: 'e-kit-library__apply-button',
			icon: isApplyLoading ? 'eicon-loading eicon-animation-spin' : '',
			hideText: false,
			variant: 'contained',
			color: isApplyLoading ? 'disabled' : 'primary',
			size: 'sm',
			onClick: ( e ) => {
				if ( ! isApplyLoading ) {
					apply( e );
				}

				onClick?.( e );
			},
			includeHeaderBtnClass: false,
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ type, subscriptionPlan, isApplyLoading, apply ] );
}

export default function ItemHeader( props ) {
	const { updateSettings } = useSettingsContext();
	const tracking = useTracking();

	const resetConnect = () => {
		const lc = elementorCommon?.config?.library_connect;
		if ( ! lc ) {
			return;
		}

		lc.is_connected = false;
		lc.current_access_level = 0;
		lc.current_access_tier = TIERS.free;
		lc.plan_type = TIERS.free;

		updateSettings( {
			is_library_connected: false,
			access_level: 0,
			access_tier: TIERS.free,
		} );
	};

	const [ isConnectDialogOpen, setIsConnectDialogOpen ] = useState( false );
	const [ downloadLinkData, setDownloadLinkData ] = useState( null );
	const [ error, setError ] = useState( false );
	const handleKitError = ( { code } ) => {
		if ( 401 === code ) {
			resetConnect();
			setIsConnectDialogOpen( true );
			return;
		}
		setError( {
			code,
			message: __( 'Something went wrong.', 'elementor' ),
		} );
	};
	const kitData = {
		kitName: props.model.title,
		pageId: props.pageId,
	};
	const { mutate: apply, isLoading: isApplyLoading } = useDownloadLinkMutation(
		props.model,
		{
			onSuccess: ( { data } ) => setDownloadLinkData( data ),
			onError: handleKitError,
		},
	);

	const { mutate: fetchDownloadLink, isLoading: isDownloadLoading } =
		useDownloadLinkMutation( props.model, {
			onSuccess: ( response ) => {
				try {
					const linkUrl = response?.data?.data?.download_link;
					if ( linkUrl ) {
						window.open( linkUrl, '_blank' );
					}
				} catch ( e ) {
					setError( { message: __( 'Something went wrong.', 'elementor' ) } );
				}
			},
			onError: handleKitError,
		} );

	const { subscriptionPlan } = useKitCallToAction( props.model.accessTier );

	const applyButton = useKitCallToActionButton( props.model, {
		onConnect: () => setIsConnectDialogOpen( true ),
		apply,
		isApplyLoading,
		onClick: () => {
			appsEventTrackingDispatch( 'kit-library/apply-kit', {
				kit_name: props.model.title,
				element_position: 'app_header',
				page_source: props.pageId,
				event_type: 'click',
			} );
			tracking.trackKitdemoApplyClicked( props.model.id, props.model.title, props.model.accessTier );
		},
		onUpgrade: () => {
			tracking.trackKitdemoUpgradeClicked( props.model.id, props.model.title, subscriptionPlan.label );
		},
	} );

	const downloadButton = useMemo( () => {
		return {
			id: 'download',
			text: __( 'Download Website', 'elementor' ),
			hideText: true,
			icon: 'eicon-file-download',
			tooltip: __( 'Download Website ZIP', 'elementor' ),
			color: isDownloadLoading ? 'disabled' : 'secondary',
			includeHeaderBtnClass: false,
			onClick: ( e ) => {
				if ( isDownloadLoading ) {
					return;
				}

				tracking.trackKitdemoDownloadClicked( props.model.id, props.model.title, () => fetchDownloadLink( e ) );
			},
		};
	}, [ isDownloadLoading, fetchDownloadLink, tracking, props.model.id, props.model.title ] );

	const buttons = useMemo(
		() => [ downloadButton, applyButton, ...props.buttons ],
		[ props.buttons, applyButton, downloadButton ],
	);

	return (
		<>
			{ error && (
				<Dialog
					title={ error.message }
					text={ __(
						'Go to the pages screen to make sure your kit pages have been imported successfully. If not, try again.',
						'elementor',
					) }
					approveButtonText={ __( 'Go to pages', 'elementor' ) }
					approveButtonColor="primary"
					approveButtonUrl={
						elementorAppConfig.admin_url + 'edit.php?post_type=page'
					}
					approveButtonOnClick={ () => setError( false ) }
					dismissButtonText={ __( 'Got it', 'elementor' ) }
					dismissButtonOnClick={ () => setError( false ) }
					onClose={ () => setError( false ) }
				/>
			) }
			{ downloadLinkData && (
				<KitDialog
					id={ props.model.id }
					downloadLinkData={ downloadLinkData }
					onClose={ () => setDownloadLinkData( null ) }
				/>
			) }
			{ isConnectDialogOpen && (
				<ConnectDialog
					pageId={ props.pageId }
					onClose={ () => setIsConnectDialogOpen( false ) }
					onSuccess={ ( data ) => {
						const accessLevel =
							data.kits_access_level || data.access_level || 0;
						const accessTier = data.access_tier;

						elementorCommon.config.library_connect.is_connected = true;
						elementorCommon.config.library_connect.current_access_level =
							accessLevel;
						elementorCommon.config.library_connect.current_access_tier =
							accessTier;
						elementorCommon.config.library_connect.plan_type = data.plan_type;

						updateSettings( {
							is_library_connected: true,
							access_level: accessLevel, // BC: Check for 'access_level' prop
							access_tier: accessTier,
						} );

						if ( data.access_level < props.model.accessLevel ) {
							return;
						}

						if ( ! isTierAtLeast( accessTier, props.model.accessTier ) ) {
							return;
						}

						apply();
					} }
					onError={ ( message ) => setError( { message } ) }
				/>
			) }
			<Header
				startColumn={ <HeaderBackButton { ...kitData } kitId={ props.model.id } /> }
				centerColumn={ props.centerColumn }
				buttons={ buttons }
				{ ...kitData }
			/>
		</>
	);
}

ItemHeader.propTypes = {
	model: PropTypes.instanceOf( Kit ).isRequired,
	centerColumn: PropTypes.node,
	buttons: PropTypes.arrayOf( PropTypes.object ),
	pageId: PropTypes.string,
};
