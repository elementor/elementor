import * as React from 'react';
import { LinkedDimensionsControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { useDirection } from '../../../hooks/use-direction';
import { PanelDivider } from '../../panel-divider';
import { SectionContent } from '../../section-content';

const MARGIN_LABEL = __( 'Margin', 'elementor' );
const PADDING_LABEL = __( 'Padding', 'elementor' );

export const SpacingSection = () => {
	const { isSiteRtl } = useDirection();

	return (
		<SectionContent>
			<StylesField bind={ 'margin' } propDisplayName={ MARGIN_LABEL }>
				<LinkedDimensionsControl
					label={ MARGIN_LABEL }
					isSiteRtl={ isSiteRtl }
					extendedOptions={ [ 'auto' ] }
				/>
			</StylesField>
			<PanelDivider />
			<StylesField bind={ 'padding' } propDisplayName={ PADDING_LABEL }>
				<LinkedDimensionsControl label={ PADDING_LABEL } isSiteRtl={ isSiteRtl } />
			</StylesField>
		</SectionContent>
	);
};
