import * as React from 'react';
import { useState } from 'react';
import { PromotionChip, PromotionInfotip } from '@elementor/editor-ui';
import { SitemapIcon } from '@elementor/icons';
import { Box, IconButton, Stack, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { createControl } from '../../create-control';

const ARIA_LABEL = __( 'Display Conditions', 'elementor' );

function getDisplayConditionPromotion() {
	return window.elementor?.config?.v4Promotions?.displayConditions;
}

export const DisplayConditionsControl = createControl( () => {
	const [ isInfotipOpen, setIsInfotipOpen ] = useState( false );
	const promotion = getDisplayConditionPromotion();

	return (
		<Stack
			direction="row"
			spacing={ 2 }
			sx={ {
				justifyContent: 'flex-end',
				alignItems: 'center',
			} }
		>
			<PromotionInfotip
				title={ promotion?.title ?? '' }
				content={ promotion?.content ?? '' }
				assetUrl={ promotion?.image ?? '' }
				ctaUrl={ promotion?.ctaUrl ?? '' }
				open={ isInfotipOpen }
				onClose={ () => setIsInfotipOpen( false ) }
			>
				<Box
					onClick={ () => setIsInfotipOpen( ( prev ) => ! prev ) }
					sx={ { cursor: 'pointer', display: 'inline-flex' } }
				>
					<PromotionChip />
				</Box>
			</PromotionInfotip>
			<Tooltip title={ ARIA_LABEL } placement="top">
				<IconButton
					size="tiny"
					aria-label={ ARIA_LABEL }
					data-behavior="display-conditions"
					onClick={ () => setIsInfotipOpen( ( prev ) => ! prev ) }
					sx={ {
						border: '1px solid',
						borderColor: 'divider',
						borderRadius: 1,
					} }
				>
					<SitemapIcon fontSize="tiny" color="disabled" />
				</IconButton>
			</Tooltip>
		</Stack>
	);
} );
