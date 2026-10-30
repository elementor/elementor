import * as React from 'react';
import { forwardRef, type MouseEvent, type RefObject, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { type PromotionTrackingData, trackUpgradePromotionClick, trackViewPromotion } from '@elementor/editor-controls';
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
	openPromotion: ( context?: { target_value?: string } ) => void;
};

export const InteractionsPromotionChip = forwardRef< InteractionsPromotionChipRef, InteractionsPromotionChipProps >(
	( { content, upgradeUrl, anchorRef, trackingData }, ref ) => {
		const [ isOpen, setIsOpen ] = useState( false );
		const trackingPayloadRef = useRef( trackingData );

		useCanvasClickHandler( isOpen, () => setIsOpen( false ) );

		const openPromotion = useCallback(
			( context?: { target_value?: string } ) => {
				const payload: PromotionTrackingData = context?.target_value
					? { ...trackingData, target_value: context.target_value }
					: trackingData;

				setIsOpen( ( prev ) => {
					if ( prev ) {
						return prev;
					}

					trackingPayloadRef.current = payload;
					trackViewPromotion( payload );
					return true;
				} );
			},
			[ trackingData ]
		);

		const toggle = useCallback( () => {
			setIsOpen( ( prev ) => {
				if ( ! prev ) {
					trackingPayloadRef.current = trackingData;
					trackViewPromotion( trackingData );
				}
				return ! prev;
			} );
		}, [ trackingData ] );

		useImperativeHandle( ref, () => ( { toggle, openPromotion } ), [ toggle, openPromotion ] );

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
				onCtaClick={ () => trackUpgradePromotionClick( trackingPayloadRef.current ) }
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
