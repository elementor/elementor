import * as React from 'react';
import { useRef } from 'react';
import { PromotionTrigger, type PromotionTriggerRef } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StyleTabSection } from '../style-tab-section';

export const CustomCssSection = () => {
	const triggerRef = useRef< PromotionTriggerRef >( null );

	return (
		<StyleTabSection
			section={ {
				name: 'Custom CSS',
				title: __( 'Custom CSS', 'elementor' ),
				action: {
					component: <PromotionTrigger ref={ triggerRef } promotionKey="customCss" />,
					onClick: () => triggerRef.current?.toggle(),
				},
			} }
		/>
	);
};
