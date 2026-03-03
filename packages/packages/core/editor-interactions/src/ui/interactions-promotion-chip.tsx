import * as React from 'react';
import { forwardRef, type MouseEvent, type RefObject, useImperativeHandle, useState } from 'react';
import { PromotionChip, PromotionPopover, useCanvasClickHandler } from '@elementor/editor-ui';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export type InteractionsPromotionChipProps = {
	content: string;
	upgradeUrl: string;
	anchorRef?: RefObject< HTMLElement | null >;
};

export type InteractionsPromotionChipRef = {
	toggle: () => void;
};

export const InteractionsPromotionChip = forwardRef< InteractionsPromotionChipRef, InteractionsPromotionChipProps >(
	( { content, upgradeUrl, anchorRef }, ref ) => {
		const [ isOpen, setIsOpen ] = useState( false );

		useCanvasClickHandler( isOpen, () => setIsOpen( false ) );

		const toggle = () => setIsOpen( ( prev ) => ! prev );

		useImperativeHandle( ref, () => ( { toggle } ), [] );

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
