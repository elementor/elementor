import * as React from 'react';
import { forwardRef, type ReactNode, useImperativeHandle, useState } from 'react';
import { PromotionChip, PromotionInfotip } from '@elementor/editor-ui';
import { Box } from '@elementor/ui';

import type { V4PromotionData, V4PromotionKey } from './types';

function getV4Promotion( key: V4PromotionKey ): V4PromotionData | undefined {
	return window.elementor?.config?.v4Promotions?.[ key ];
}

type PromotionTriggerProps = {
	promotionKey: V4PromotionKey;
	children?: ReactNode;
};

export type PromotionTriggerRef = {
	toggle: () => void;
};

export const PromotionTrigger = forwardRef< PromotionTriggerRef, PromotionTriggerProps >(
	( { promotionKey, children }, ref ) => {
		const [ isOpen, setIsOpen ] = useState( false );
		const promotion = getV4Promotion( promotionKey );

		const toggle = () => setIsOpen( ( prev ) => ! prev );

		useImperativeHandle( ref, () => ( { toggle } ), [] );

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
