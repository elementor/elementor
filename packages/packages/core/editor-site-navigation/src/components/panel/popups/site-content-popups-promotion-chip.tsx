import * as React from 'react';
import { forwardRef, type MouseEvent, useCallback, useImperativeHandle, useState } from 'react';
import { type PromotionTrackingData, trackUpgradePromotionClick, trackViewPromotion } from '@elementor/editor-controls';
import { PromotionChip, PromotionPopover, useCanvasClickHandler } from '@elementor/editor-ui';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { env } from '../../../env';
import { POPUP_SITE_CONTENT_UPGRADE_URL } from '../../../popups/constants';

const TRACKING_DATA: PromotionTrackingData = {
	target_name: 'popups',
	target_location: 'widget_panel',
};

export type SiteContentPopupsPromotionChipRef = {
	toggle: () => void;
};

export const SiteContentPopupsPromotionChip = forwardRef< SiteContentPopupsPromotionChipRef >( ( _, ref ) => {
	const [ isOpen, setIsOpen ] = useState( false );
	const upgradeUrl = env.popups?.upgrade_url ?? POPUP_SITE_CONTENT_UPGRADE_URL;

	useCanvasClickHandler( isOpen, () => setIsOpen( false ) );

	const toggle = useCallback( () => {
		setIsOpen( ( previous ) => {
			if ( ! previous ) {
				trackViewPromotion( TRACKING_DATA );
			}

			return ! previous;
		} );
	}, [] );

	useImperativeHandle( ref, () => ( { toggle } ), [ toggle ] );

	return (
		<PromotionPopover
			open={ isOpen }
			title={ __( 'Popups', 'elementor' ) }
			content={ __( 'Upgrade to continue creating and editing popups.', 'elementor' ) }
			ctaText={ __( 'Upgrade now', 'elementor' ) }
			ctaUrl={ upgradeUrl }
			onClose={ ( event: MouseEvent ) => {
				event.stopPropagation();
				setIsOpen( false );
			} }
			onCtaClick={ () => trackUpgradePromotionClick( TRACKING_DATA ) }
		>
			<Box
				onClick={ ( event: MouseEvent ) => {
					event.stopPropagation();
					toggle();
				} }
				sx={ { cursor: 'pointer', display: 'inline-flex' } }
			>
				<PromotionChip />
			</Box>
		</PromotionPopover>
	);
} );
