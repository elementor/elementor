import * as React from 'react';
import { PromotionInfotip } from '@elementor/editor-ui';
import { CrownFilledIcon } from '@elementor/icons';
import { Chip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { StyleTabSection } from '../style-tab-section';

export const CustomCssSection = () => {
	return (
		<StyleTabSection
			section={ {
				name: 'Custom CSS',
				title: __( 'Custom CSS', 'elementor' ),
				action: (
					<PromotionInfotip
						title={ __( 'Custom CSS', 'elementor' ) }
						content={ __(
							'Add custom CSS to refine and enrich the appearance of any element on your site.',
							'elementor'
						) }
						assetUrl="https://assets.elementor.com/packages/v1/images/custom-css-promotion.png"
						ctaUrl="https://go.elementor.com/go-pro-style-custom-css/"
					>
						<Chip size="tiny" color="promotion" variant="standard" icon={ <CrownFilledIcon /> } />
					</PromotionInfotip>
				),
			} }
		/>
	);
};
