import * as React from 'react';
import {
	forwardRef,
	type MouseEvent,
	type RefObject,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react';
import { type PromotionTrackingData, trackUpgradePromotionClick, trackViewPromotion } from '@elementor/editor-controls';
import { PromotionChip, PromotionPopover, useCanvasClickHandler } from '@elementor/editor-ui';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export type InteractionsPromotionChipProps = {
	content: string;
	upgradeUrl: string;
	anchorRef?: RefObject< HTMLElement | null >;
	showTrigger?: boolean;
	onOpenChange?: ( open: boolean ) => void;
	trackingData: PromotionTrackingData;
};

export type InteractionsPromotionChipRef = {
	toggle: () => void;
	openPromotion: ( context?: { target_value?: string } ) => void;
	closePromotion: () => void;
};

export const InteractionsPromotionChip = forwardRef< InteractionsPromotionChipRef, InteractionsPromotionChipProps >(
	( { content, upgradeUrl, anchorRef, showTrigger = true, onOpenChange, trackingData }, ref ) => {
		const [ isOpen, setIsOpen ] = useState( false );
		const trackingPayloadRef = useRef( trackingData );
		const suppressCanvasDismissUntilRef = useRef( 0 );

		const closePromotion = useCallback( () => {
			setIsOpen( false );
		}, [] );

		const handleCanvasDismiss = useCallback(
			( e: globalThis.MouseEvent ) => {
				if ( performance.now() < suppressCanvasDismissUntilRef.current ) {
					e.stopPropagation();
					return;
				}

				closePromotion();
			},
			[ closePromotion ]
		);

		useCanvasClickHandler( isOpen && ! anchorRef, handleCanvasDismiss );

		useEffect( () => {
			onOpenChange?.( isOpen );
		}, [ isOpen, onOpenChange ] );

		const openPromotion = useCallback(
			( context?: { target_value?: string } ) => {
				const payload: PromotionTrackingData = context?.target_value
					? { ...trackingData, target_value: context.target_value }
					: trackingData;

				suppressCanvasDismissUntilRef.current = performance.now() + 150;

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
					suppressCanvasDismissUntilRef.current = performance.now() + 150;
					trackingPayloadRef.current = trackingData;
					trackViewPromotion( trackingData );
				}
				return ! prev;
			} );
		}, [ trackingData ] );

		useImperativeHandle( ref, () => ( { toggle, openPromotion, closePromotion } ), [
			toggle,
			openPromotion,
			closePromotion,
		] );

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
					closePromotion();
				} }
				onCtaClick={ () => trackUpgradePromotionClick( trackingPayloadRef.current ) }
			>
				{ showTrigger ? (
					<Box
						onMouseDown={ ( e: MouseEvent ) => e.stopPropagation() }
						onClick={ handleToggle }
						sx={ { cursor: 'pointer', display: 'inline-flex', mr: 1 } }
					>
						<PromotionChip />
					</Box>
				) : (
					<Box aria-hidden sx={ { width: 0, height: 0, overflow: 'hidden' } } />
				) }
			</PromotionPopover>
		);
	}
);
