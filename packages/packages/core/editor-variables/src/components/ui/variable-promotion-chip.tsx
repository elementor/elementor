import * as React from 'react';
import { type MouseEvent, useEffect, useState } from 'react';
import { PromotionChip, PromotionPopover } from '@elementor/editor-ui';
import { getCanvasIframeDocument } from '@elementor/editor-v1-adapters';
import { Box } from '@elementor/ui';
import { capitalize } from '@elementor/utils';
import { __, sprintf } from '@wordpress/i18n';

type VariablePromotionChipProps = {
	variableType: string;
	upgradeUrl: string;
};

export const VariablePromotionChip = ( { variableType, upgradeUrl }: VariablePromotionChipProps ) => {
	const [ isOpen, setIsOpen ] = useState( false );

	useEffect( () => {
		const canvasDocument = isOpen ? getCanvasIframeDocument() : null;

		if ( ! canvasDocument ) {
			return;
		}

		canvasDocument.addEventListener( 'mousedown', () => setIsOpen( false ) );

		return () => canvasDocument.removeEventListener( 'mousedown', () => setIsOpen( false ) );
	}, [ isOpen ] );

	const toggle = () => setIsOpen( ( prev ) => ! prev );

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
			onClose={ () => setIsOpen( false ) }
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
};
