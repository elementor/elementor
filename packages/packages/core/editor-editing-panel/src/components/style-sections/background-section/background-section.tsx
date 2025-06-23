import * as React from 'react';
import { BackgroundControl } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { SectionContent } from '../../section-content';

const BACKGROUND_LABEL = __( 'Background', 'elementor' );

export const BackgroundSection = () => {
	return (
		<SectionContent>
			<StylesField bind="background" propDisplayName={ BACKGROUND_LABEL }>
				<BackgroundControl />
			</StylesField>
		</SectionContent>
	);
};
