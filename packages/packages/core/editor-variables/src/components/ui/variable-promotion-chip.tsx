import * as React from 'react';
import { forwardRef, type MouseEvent, useCallback, useImperativeHandle, useState } from 'react';
import { type PromotionTrackingData, trackUpgradePromotionClick, trackViewPromotion } from '@elementor/editor-controls';
import { PromotionChip, PromotionPopover, useCanvasClickHandler } from '@elementor/editor-ui';
import { Box } from '@elementor/ui';
import { capitalize } from '@elementor/utils';
import { __, sprintf } from '@wordpress/i18n';

type VariablePromotionChipProps = {
	variableType: string;
	upgradeUrl: string;
	trackingData: PromotionTrackingData;
};

export type VariablePromotionChipRef = {
	toggle: () => void;
};

export const VariablePromotionChip = forwardRef< VariablePromotionChipRef, VariablePromotionChipProps >(
	( { variableType, upgradeUrl, trackingData }, ref ) => {
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

		const title = sprintf(
			/* translators: %s: Variable Type. */
			__( '%s variables', 'elementor' ),
			capitalize( variableType )
		);

		const content = sprintf(
			/* translators: %s: Variable Type. */
			__( 'Upgrade to continue creating and editing %s variables.', 'elementor' ),
			variableType
		);

		return (
			<PromotionPopover
				open={ isOpen }
				title={ title }
				content={ content }
				ctaText={ __( 'Upgrade now', 'elementor' ) }
				ctaUrl={ upgradeUrl }
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
					<PromotionChip />
				</Box>
			</PromotionPopover>
		);
	}
);
