import * as React from 'react';
import { useRef } from 'react';
import { PromotionTrigger, type PromotionTriggerRef } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StyleTabSection } from '../style-tab-section';

const TRACKING_DATA = { target_name: 'custom_css', location_l2: 'style' } as const;

export const CustomCssSection = () => {
	const triggerRef = useRef< PromotionTriggerRef >( null );

	return (
		<StyleTabSection
			section={ {
				name: 'Custom CSS',
				title: __( 'Custom CSS', 'elementor' ),
				action: {
					component: (
						<PromotionTrigger ref={ triggerRef } promotionKey="customCss" trackingData={ TRACKING_DATA } />
					),
					onClick: () => triggerRef.current?.toggle(),
				},
			} }
		/>
	);
};
