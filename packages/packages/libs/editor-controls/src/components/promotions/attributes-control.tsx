import * as React from 'react';
import { useRef } from 'react';
import { PlusIcon } from '@elementor/icons';
import { Stack, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { createControl } from '../../create-control';
import { PromotionTrigger, type PromotionTriggerRef } from './promotion-trigger';

const ARIA_LABEL = __( 'Attributes', 'elementor' );
const TRACKING_DATA = { target_name: 'attributes', location_l2: 'general' } as const;

export const AttributesControl = createControl( () => {
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
			<PromotionTrigger ref={ triggerRef } promotionKey="attributes" trackingData={ TRACKING_DATA } />
			<Tooltip title={ ARIA_LABEL } placement="top">
				<PlusIcon
					aria-label={ ARIA_LABEL }
					fontSize="tiny"
					color="disabled"
					onClick={ () => triggerRef.current?.toggle() }
					sx={ { cursor: 'pointer' } }
				/>
			</Tooltip>
		</Stack>
	);
} );
