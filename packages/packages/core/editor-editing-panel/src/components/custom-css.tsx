import * as React from 'react';
import { CssEditor } from '@elementor/editor-controls';

import { useCustomCss } from '../hooks/use-custom-css';
import { SectionContent } from './section-content';

export const CustomCss = () => {
	const { customCss, setCustomCss } = useCustomCss();

	const handleChange = ( value: string ) => {
		setCustomCss( value, { history: { propDisplayName: 'Custom CSS' } } );
	};

	return (
		<SectionContent>
			<CssEditor value={ customCss?.raw || '' } onChange={ handleChange } />
		</SectionContent>
	);
};
