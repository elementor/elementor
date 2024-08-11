import React, { useEffect, useState } from 'react';
import useUserInfo from './hooks/use-user-info';
import Loader from './components/loader';
import { onConnect } from './utils/editor-integration';
import PropTypes from 'prop-types';
import { WizardDialogWrapper } from './components/wizard-dialog-wrapper';
import ConnectAndGetStarted from './pages/connect/connect-and-get-started';
import { setGetStarted } from './api';
import AiPromotionInfotipWrapper from './components/ai-promotion-infotip-wrapper';
import { __ } from '@wordpress/i18n';

function isElementInViewport( el ) {
	const rect = el.getBoundingClientRect();
	return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <= ( window.innerHeight || document.documentElement.clientHeight ) &&
		rect.right <= ( window.innerWidth || document.documentElement.clientWidth )
	);
}

export const AiGetStartedConnect = ( { onClose, source } ) => {
	const { isLoading, isConnected, isGetStarted, connectUrl, fetchData } = useUserInfo();
	const [ shouldShowPromotion, setShouldShowPromotion ] = useState( false );

	useEffect( () => {
		if ( isGetStarted && isConnected ) {
			const element = elementorFrontend.elements.$body[ 0 ].querySelector( '.e-ai-layout-button' );
			if ( ! isElementInViewport( element ) ) {
				element.scrollIntoView( { behavior: 'smooth' } );
			}

			setTimeout( () => {
				setShouldShowPromotion( true );
			}, 1000 );
		}
	}, [ isGetStarted, isConnected ] );

	if ( isLoading ) {
		return (
			<WizardDialogWrapper onClose={ onClose }>
				<Loader BoxProps={ { sx: { px: 3 } } } />
			</WizardDialogWrapper>
		);
	}

	if ( ! isConnected || ! isGetStarted ) {
		return (
			<WizardDialogWrapper onClose={ onClose }>
				<ConnectAndGetStarted
					connectUrl={ connectUrl }
					isConnected={ isConnected }
					getStartedAction={ async () => {
						await setGetStarted();
						fetchData();
					} }
					onSuccess={ async ( data ) => {
						onConnect( data );
						fetchData();
						await setGetStarted();
						fetchData();
					} }
				/>
			</WizardDialogWrapper>
		);
	}

	if ( shouldShowPromotion ) {
		const element = window.elementorFrontend.elements.$body[ 0 ].querySelector( '.e-ai-layout-button' );
		const { x: canvasOffsetX, y: canvasOffsetY } = document.querySelector( '#elementor-preview-iframe' ).getBoundingClientRect();

		return <AiPromotionInfotipWrapper
			test-id="ai-promotion-infotip-wrapper"
			source={ source }
			anchor={ element }
			clickAction={ () => {
				element.click();
			} }
			header={ __( 'Create any layout with a prompt', 'elementor' ) }
			contentText={ __( 'Now you can generate any layout or container for your website’s design.', 'elementor' ) }
			mainActionText={ __( 'Try it', 'elementor' ) }
			controlType={ 'container' }
			unmountAction={ onClose }
			colorScheme={ elementor?.getPreferences?.( 'ui_theme' ) || 'auto' }
			isRTL={ elementorCommon.config.isRTL }
			placement={ 'top' }
			offset={ { x: canvasOffsetX, y: canvasOffsetY } }
		/>;
	}
};

AiGetStartedConnect.propTypes = {
	onClose: PropTypes.func.isRequired,
	source: PropTypes.string.isRequired,
};
