import * as React from 'react';
import { forwardRef, type MouseEvent, type RefObject, useCallback, useImperativeHandle, useState } from 'react';
import { type PromotionTrackingData, trackViewPromotion, trackUpgradePromotionClick } from '@elementor/editor-controls';
import { PromotionChip, PromotionPopover, useCanvasClickHandler } from '@elementor/editor-ui';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export type InteractionsPromotionChipProps = {
	content: string;
	upgradeUrl: string;
	anchorRef?: RefObject< HTMLElement | null >;
	trackingData: PromotionTrackingData;
};

export type InteractionsPromotionChipRef = {
	toggle: () => void;
};

export const InteractionsPromotionChip = forwardRef< InteractionsPromotionChipRef, InteractionsPromotionChipProps >(
	( { content, upgradeUrl, anchorRef, trackingData }, ref ) => {
		const [ isOpen, setIsOpen ] = useState( false );

		useCanvasClickHandler( isOpen, () => setIsOpen( false ) );

		const toggle = useCallback( () => {
			setIsOpen( ( prev ) => {
				if ( ! prev ) {
					trackViewPromotion( trackingData );
				}
				return ! prev;
			} );
		}, [ trackingData ] );

		useImperativeHandle( ref, () => ( { toggle } ), [ toggle ] );

		const handleToggle = ( e: MouseEvent ) => {
			e.stopPropagation();
			toggle();
		};

		return (
			<PromotionPopover
				open={ isOpen }
				title={ __( 'Interactions', 'elementor' ) }
				content={ content }
				ctaText={ __( 'Upgrade now', 'elementor' ) }
				ctaUrl={ upgradeUrl }
				anchorRef={ anchorRef }
				placement={ anchorRef ? 'right-start' : undefined }
				onClose={ ( e: MouseEvent ) => {
					e.stopPropagation();
					setIsOpen( false );
				} }
				onCtaClick={ () => trackUpgradePromotionClick( trackingData ) }
			>
				<Box
					onMouseDown={ ( e: MouseEvent ) => e.stopPropagation() }
					onClick={ handleToggle }
					sx={ { cursor: 'pointer', display: 'inline-flex', mr: 1 } }
				>
					<PromotionChip />
				</Box>
			</PromotionPopover>
		);
	}
);

InteractionsPromotionChip.displayName = 'InteractionsPromotionChip';
