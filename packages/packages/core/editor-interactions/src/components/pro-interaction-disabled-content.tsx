import * as React from 'react';
import { useRef } from 'react';
import { useCurrentUserCapabilities } from '@elementor/editor-current-user';
import { PromotionPopover } from '@elementor/editor-ui';
import { __ } from '@wordpress/i18n';

export const ProInteractionDisabledContent = ( {
	promoPopover,
	setPromoPopover,
}: {
	promoPopover: { open: boolean; anchorEl: HTMLElement | null };
	setPromoPopover: ( promoPopover: { open: boolean; anchorEl: HTMLElement | null } ) => void;
} ) => {
	const promoAnchorRef = useRef< HTMLElement | null >( null );
	promoAnchorRef.current = promoPopover.anchorEl;

	const { isAdmin } = useCurrentUserCapabilities();
	const adminUrl = ( window as unknown as { elementorAppConfig: { admin_url: string } } ).elementorAppConfig
		?.admin_url;
	const ctaUrl = adminUrl ? `${ adminUrl }plugins.php` : 'https://go.elementor.com/go-pro-interactions/';
	return (
		<PromotionPopover
			open={ promoPopover.open }
			title={ __( 'Interactions', 'elementor' ) }
			content={ __(
				'This interaction is currently inactive and not showing on your website. Activate your Pro plugin to use it again.',
				'elementor'
			) }
			ctaText={ isAdmin ? __( 'Upgrade now', 'elementor' ) : undefined }
			ctaUrl={ ctaUrl }
			onClose={ () => setPromoPopover( { open: false, anchorEl: null } ) }
			anchorRef={ promoAnchorRef }
			placement="right-start"
		/>
	);
};
