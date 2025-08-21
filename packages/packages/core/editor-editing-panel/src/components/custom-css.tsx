import * as React from 'react';
import { CssEditor } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { useCustomCss } from '../hooks/use-custom-css';
import { ControlLabel } from './control-label';
import { SectionContent } from './section-content';

export const CustomCss = () => {
	const { customCss, setCustomCss } = useCustomCss();

	const handleChange = ( value: string ) => {
		setCustomCss( value, { history: { propDisplayName: 'Custom CSS' } } );
	};

	return (
		<SectionContent>
			<ControlLabel>{ __( 'Custom CSS code editor', 'elementor' ) }</ControlLabel>
			<CssEditor value={ customCss?.raw || '' } onChange={ handleChange } />
		</SectionContent>
	);
};
