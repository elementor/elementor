import * as React from 'react';
import { useRef } from 'react';
import { PlusIcon } from '@elementor/icons';
import { Stack, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { createControl } from '../../create-control';
import { PromotionTrigger, type PromotionTriggerRef } from './promotion-trigger';

const ARIA_LABEL = __( 'Attributes', 'elementor' );

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
			<PromotionTrigger ref={ triggerRef } promotionKey="attributes" />
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
