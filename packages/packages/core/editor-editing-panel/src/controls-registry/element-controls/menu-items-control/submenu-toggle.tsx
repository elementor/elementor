import * as React from 'react';
import { useRef, useState } from 'react';
import { ControlFormLabel } from '@elementor/editor-controls';
import { PromotionChip, PromotionPopover } from '@elementor/editor-ui';
import { Box, Stack, Switch } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getSubmenuPromotion } from './use-submenu';

type Props = {
	entryId: string | null;
};

export const SubmenuToggle = ( { entryId }: Props ) => {
	const [ isPromotionOpen, setIsPromotionOpen ] = useState( false );
	const anchorRef = useRef< HTMLDivElement >( null );
	const promotion = getSubmenuPromotion();

	if ( ! entryId || ! promotion ) {
		return null;
	}

	return (
		<Stack direction="row" alignItems="center" justifyContent="space-between" ref={ anchorRef }>
			<Stack direction="row" alignItems="center">
				<ControlFormLabel>{ __( 'Enable Submenu', 'elementor' ) }</ControlFormLabel>
				<PromotionPopover
					open={ isPromotionOpen }
					title={ promotion.title }
					content={ promotion.content }
					ctaUrl={ promotion.ctaUrl }
					ctaText={ __( 'Upgrade Now', 'elementor' ) }
					onClose={ () => setIsPromotionOpen( false ) }
					anchorRef={ anchorRef }
				>
					<Box
						component="span"
						onClick={ () => setIsPromotionOpen( ( open ) => ! open ) }
						sx={ { display: 'inline-flex', cursor: 'pointer' } }
					>
						<PromotionChip />
					</Box>
				</PromotionPopover>
			</Stack>
			<Box sx={ { marginInlineEnd: -1 } }>
				<Switch
					size="small"
					checked={ false }
					disabled
					inputProps={ { 'aria-label': __( 'Enable Submenu', 'elementor' ) } }
				/>
			</Box>
		</Stack>
	);
};
