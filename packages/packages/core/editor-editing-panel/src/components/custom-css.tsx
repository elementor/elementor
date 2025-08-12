import * as React from 'react';
import { ControlFormLabel, CssEditor } from '@elementor/editor-controls';
import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useCustomCss } from '../hooks/use-custom-css';
import { Section } from './section';
import { SectionContent } from './section-content';
import { CustomCssIndicator, getCustomCssIndicator } from './style-tab-collapsible-content';

export const CustomCss = () => {
	const { customCss, setCustomCss } = useCustomCss();

	const handleChange = ( value: string ) => {
		setCustomCss( value, { history: { propDisplayName: 'Custom CSS' } } );
	};

	return (
		<SectionContent>
			<Stack direction="row" alignItems="center" justifyItems="start" gap={ 1 }>
				<ControlFormLabel>{ __( 'Custom CSS code editor', 'elementor' ) }</ControlFormLabel>
				<CustomCssIndicator />
			</Stack>
			<CssEditor value={ customCss?.raw || '' } onChange={ handleChange } />
		</SectionContent>
	);
};

export const CustomCssSection = () => {
	return (
		<Section title={ __( 'Custom CSS', 'elementor' ) } titleEnd={ getCustomCssIndicator() }>
			<CustomCss />
		</Section>
	);
};
