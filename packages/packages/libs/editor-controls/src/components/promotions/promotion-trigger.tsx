import * as React from 'react';
import { forwardRef, type ReactNode, useCallback, useImperativeHandle, useState } from 'react';
import { PromotionChip, PromotionInfotip } from '@elementor/editor-ui';
import { Box } from '@elementor/ui';

import { trackViewPromotion, trackUpgradePromotionClick, type PromotionTrackingData } from '../../utils/tracking';
import type { V4PromotionData, V4PromotionKey } from './types';

function getV4Promotion( key: V4PromotionKey ): V4PromotionData | undefined {
	return window.elementor?.config?.v4Promotions?.[ key ];
}

type PromotionTriggerProps = {
	promotionKey: V4PromotionKey;
	children?: ReactNode;
	trackingData: PromotionTrackingData;
};

export type PromotionTriggerRef = {
	toggle: () => void;
};

export const PromotionTrigger = forwardRef< PromotionTriggerRef, PromotionTriggerProps >(
	( { promotionKey, children, trackingData }, ref ) => {
		const [ isOpen, setIsOpen ] = useState( false );
		const promotion = getV4Promotion( promotionKey );

		const toggle = useCallback( () => {
			setIsOpen( ( prev ) => {
				if ( ! prev ) {
					trackViewPromotion( trackingData );
				}
				return ! prev;
			} );
		}, [ trackingData ] );

		useImperativeHandle( ref, () => ( { toggle } ), [ toggle ] );

		return (
			<>
				{ promotion && (
					<PromotionInfotip
						title={ promotion.title }
						content={ promotion.content }
						assetUrl={ promotion.image }
						ctaUrl={ promotion.ctaUrl }
						open={ isOpen }
						onClose={ ( e: MouseEvent ) => {
							e.stopPropagation();
							setIsOpen( false );
						} }
						onCtaClick={ () => trackUpgradePromotionClick( trackingData ) }
					>
						<Box
							onClick={ ( e: MouseEvent ) => {
								e.stopPropagation();
								toggle();
							} }
							sx={ { cursor: 'pointer', display: 'inline-flex' } }
						>
							{ children ?? <PromotionChip /> }
						</Box>
					</PromotionInfotip>
				) }
			</>
		);
	}
);
