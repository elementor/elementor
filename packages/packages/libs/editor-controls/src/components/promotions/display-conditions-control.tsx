import * as React from 'react';
import { useRef } from 'react';
import { SitemapIcon } from '@elementor/icons';
import { IconButton, Stack, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { createControl } from '../../create-control';
import { PromotionTrigger, type PromotionTriggerRef } from './promotion-trigger';

const ARIA_LABEL = __( 'Display Conditions', 'elementor' );

export const DisplayConditionsControl = createControl( () => {
	const triggerRef = useRef< PromotionTriggerRef >( null );

	return (
		<Stack
			direction="row"
			spacing={ 2 }
			sx={ {
				justifyContent: 'flex-end',
				alignItems: 'center',
			} }
		>
			<PromotionTrigger ref={ triggerRef } promotionKey="displayConditions" />
			<Tooltip title={ ARIA_LABEL } placement="top">
				<IconButton
					size="tiny"
					aria-label={ ARIA_LABEL }
					data-behavior="display-conditions"
					onClick={ () => triggerRef.current?.toggle() }
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
