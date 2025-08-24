import * as React from 'react';
import { ControlAdornments, ControlFormLabel, CssEditor } from '@elementor/editor-controls';
import { Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useCustomCss } from '../hooks/use-custom-css';
import { CustomCssField } from './custom-css-field';
import { SectionContent } from './section-content';

export const CustomCss = () => {
	const { customCss, setCustomCss } = useCustomCss();

	const handleChange = ( value: string ) => {
		setCustomCss( value, { history: { propDisplayName: 'Custom CSS' } } );
	};

	return (
		<SectionContent>
			<CustomCssField>
				<Stack direction="row" alignItems="center" gap={ 1 }>
					<ControlFormLabel>{ __( 'Custom CSS code editor', 'elementor' ) }</ControlFormLabel>
					<ControlAdornments />
				</Stack>
			</CustomCssField>
			<CssEditor value={ customCss?.raw || '' } onChange={ handleChange } />
		</SectionContent>
	);
};
