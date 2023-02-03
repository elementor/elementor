import ApplyKitDialog from './apply-kit-dialog';
import ConnectDialog from './connect-dialog';
import Header from './layout/header';
import HeaderBackButton from './layout/header-back-button';
import Kit from '../models/kit';
import useDownloadLinkMutation from '../hooks/use-download-link-mutation';
import useKitCallToAction, { TYPE_PROMOTION, TYPE_CONNECT } from '../hooks/use-kit-call-to-action';
import useAddKitPromotionUTM from '../hooks/use-add-kit-promotion-utm';
import { Dialog } from '@elementor/app-ui';
import { useMemo, useState } from 'react';
import { useSettingsContext } from '../context/settings-context';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';

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
 * @return {Object} result
 */
function useKitCallToActionButton( model, { apply, isApplyLoading, onConnect, onClick } ) {
	const [ type, { subscriptionPlan } ] = useKitCallToAction( model.accessLevel );
	const promotionUrl = useAddKitPromotionUTM( subscriptionPlan.promotion_url, model.id, model.title );

	return useMemo( () => {
		if ( type === TYPE_CONNECT ) {
			return {
				id: 'connect',
				text: __( 'Apply Kit', 'elementor' ), // The label is Apply kit but the this is connect button
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
				// Translators: %s is the subscription plan name.
				text: __( 'Go %s', 'elementor' ).replace( '%s', subscriptionPlan.label ),
				hideText: false,
				variant: 'contained',
				color: 'cta',
				size: 'sm',
				url: promotionUrl,
				target: '_blank',
				includeHeaderBtnClass: false,
			};
		}

		return {
			id: 'apply',
			text: __( 'Apply Kit', 'elementor' ),
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
	}, [ type, subscriptionPlan, isApplyLoading, apply ] );
}

export default function ItemHeader( props ) {
	const { updateSettings } = useSettingsContext();

	const [ isConnectDialogOpen, setIsConnectDialogOpen ] = useState( false );
	const [ downloadLinkData, setDownloadLinkData ] = useState( null );
	const [ error, setError ] = useState( false );
	const kitData = {
		kitName: props.model.title,
		pageId: props.pageId,
	};
	const { mutate: apply, isLoading: isApplyLoading } = useDownloadLinkMutation(
		props.model,
		{
			onSuccess: ( { data } ) => setDownloadLinkData( data ),
			onError: ( errorResponse ) => {
				if ( 401 === errorResponse.code ) {
					elementorCommon.config.library_connect.is_connected = false;
					elementorCommon.config.library_connect.current_access_level = 0;

					updateSettings( {
						is_library_connected: false,
						access_level: 0,
					} );

					setIsConnectDialogOpen( true );

					return;
				}

				setError( {
					code: errorResponse.code,
					message: __( 'Something went wrong.', 'elementor' ),
				} );
			},
		},
	);

	const applyButton = useKitCallToActionButton( props.model, {
		onConnect: () => setIsConnectDialogOpen( true ),
		apply,
		isApplyLoading,
		onClick: () => {
			return appsEventTrackingDispatch(
				'kit-library/apply-kit',
				{
					kit_name: props.model.title,
					element_position: 'app_header',
					page_source: props.pageId,
					event_type: 'click',
				},
			);
		},
	} );

	const buttons = useMemo( () => [ applyButton, ...props.buttons ], [ props.buttons, applyButton ] );

	return (
		<>
			{
				error && (
					<Dialog
						title={ error.message }
						text={ __( 'Nothing to worry about, just try again. If the problem continues, head over to the Help Center.', 'elementor' ) }
						approveButtonText={ __( 'Learn More', 'elementor' ) }
						approveButtonColor="link"
						approveButtonUrl="http://go.elementor.com/app-kit-library-error/"
						approveButtonOnClick={ () => setError( false ) }
						dismissButtonText={ __( 'Got it', 'elementor' ) }
						dismissButtonOnClick={ () => setError( false ) }
						onClose={ () => setError( false ) }
					/>
				)
			}
			{
				downloadLinkData && <ApplyKitDialog
					downloadLink={ downloadLinkData.data.download_link }
					nonce={ downloadLinkData.meta.nonce }
					onClose={ () => setDownloadLinkData( null ) }
				/>
			}
			{
				isConnectDialogOpen && <ConnectDialog
					pageId={ props.pageId }
					onClose={ () => setIsConnectDialogOpen( false ) }
					onSuccess={ ( data ) => {
						const accessLevel = data.kits_access_level || data.access_level || 0;

						elementorCommon.config.library_connect.is_connected = true;
						elementorCommon.config.library_connect.current_access_level = accessLevel;

						updateSettings( {
							is_library_connected: true,
							access_level: accessLevel, // BC: Check for 'access_level' prop
						} );

						if ( data.access_level < props.model.accessLevel ) {
							return;
						}

						apply();
					} }
					onError={ ( message ) => setError( { message } ) }
				/>
			}
			<Header
				startColumn={ <HeaderBackButton { ...kitData } /> }
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
