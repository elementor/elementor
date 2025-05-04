import AiPromotionInfotipWrapper from '../components/ai-promotion-infotip-wrapper';
import ReactUtils from 'elementor-utils/react';
import { getUiConfig } from '../utils/editor-integration';
import { __ } from '@wordpress/i18n';

export const addAiPromotionForSiteLogo = () => {
	const siteLogoControl = document.querySelector( '.elementor-control-site_logo' );

	if ( ! siteLogoControl ) {
		return;
	}

	const logoButton = siteLogoControl.querySelector( '.e-ai-button' );
	if ( ! logoButton ) {
		return;
	}

	const rootElement = document.createElement( 'div' );
	document.body.append( rootElement );
	const { colorScheme, isRTL } = getUiConfig();

	const { unmount } = ReactUtils.render(
		<AiPromotionInfotipWrapper
			anchor={ logoButton }
			header={ __( 'Create a unique logo with AI', 'elementor' ) }
			contentText={ __( 'Ready to stand out? Let AI turn your vision or idea into a unique, professional vector or logo with just a click.', 'elementor' ) }
			controlType="site_logo_with_ai"
			unmountAction={ () => {
				unmount();
				rootElement.remove();
			} }
			clickAction={ () => {
				logoButton.click();
			} }
			onFocusOut={ () => {} }
			colorScheme={ colorScheme }
			isRTL={ isRTL }
			placement="right"
			mainActionText={ __( 'Give it a try', 'elementor' ) }
			source="site-settings"
		/>,
		rootElement,
	);
	return true;
};
