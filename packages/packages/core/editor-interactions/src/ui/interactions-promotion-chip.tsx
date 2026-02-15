import * as React from 'react';
import { type MouseEvent, type RefObject, useState } from 'react';
import { PromotionChip, PromotionPopover, useCanvasClickHandler } from '@elementor/editor-ui';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export type InteractionsPromotionChipProps = {
	content: string;
	upgradeUrl: string;
	anchorRef?: RefObject< HTMLElement | null >;
};

export function InteractionsPromotionChip( { content, upgradeUrl, anchorRef }: InteractionsPromotionChipProps ) {
	const [ isOpen, setIsOpen ] = useState( false );

	useCanvasClickHandler( isOpen, () => setIsOpen( false ) );

	const handleToggle = ( e: MouseEvent ) => {
		e.stopPropagation();
		setIsOpen( ( prev ) => ! prev );
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
			onClose={ handleToggle }
		>
			<Box onClick={ handleToggle } sx={ { cursor: 'pointer', display: 'inline-flex', mr: 1 } }>
				<PromotionChip />
			</Box>
		</PromotionPopover>
	);
}
