import * as React from 'react';
import { forwardRef, type ReactNode } from 'react';
import { Box } from '@elementor/ui';

const OVERLAY_GRID = '1 / 1';
const CHIP_OFFSET = '50%';

type PromotionOverlayLayoutProps = {
	children: ReactNode;
	promotionChip: ReactNode;
};

export const PromotionOverlayLayout = forwardRef< HTMLDivElement, PromotionOverlayLayoutProps >(
	( { children, promotionChip }, ref ) => (
		<Box ref={ ref } sx={ { display: 'grid', alignItems: 'center' } }>
			<Box sx={ { gridArea: OVERLAY_GRID } }>{ children }</Box>
			<Box sx={ { gridArea: OVERLAY_GRID, marginInlineEnd: CHIP_OFFSET, justifySelf: 'end' } }>
				{ promotionChip }
			</Box>
		</Box>
	)
);
