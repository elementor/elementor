import * as React from 'react';
import { useState } from 'react';
import { PromotionChip, PromotionInfotip } from '@elementor/editor-ui';
import { __ } from '@wordpress/i18n';

import { StyleTabSection } from '../style-tab-section';
import { type CanvasExtendedWindow } from './types';

function getCustomCssPromotion() {
	const extendedWindow = window as unknown as CanvasExtendedWindow;

	return extendedWindow.elementor?.config?.v4Promotions?.customCss;
}

export const CustomCssSection = () => {
	const [ showInfoTip, setShowInfoTip ] = useState( false );
	const promotion = getCustomCssPromotion();

	return (
		<StyleTabSection
			section={ {
				name: 'Custom CSS',
				title: __( 'Custom CSS', 'elementor' ),
				action: (
					<PromotionInfotip
						title={ promotion?.title ?? '' }
						content={ promotion?.content ?? '' }
						assetUrl={ promotion?.image ?? '' }
						ctaUrl={ promotion?.ctaUrl ?? '' }
						open={ showInfoTip }
						setOpen={ setShowInfoTip }
					>
						<PromotionChip onClick={ () => setShowInfoTip( true ) } />
					</PromotionInfotip>
				),
			} }
		/>
	);
};
