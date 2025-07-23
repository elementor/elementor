import * as React from 'react';
import { TextField } from '@elementor/ui';

import { useCustomCss } from '../hooks/use-custom-css';
import { SectionContent } from './section-content';

export const CustomCss = () => {
	const { customCss, setCustomCss } = useCustomCss();

	return (
		<SectionContent>
			<TextField
				value={ customCss?.raw || '' }
				onChange={ ( ev: React.ChangeEvent< HTMLInputElement > ) =>
					setCustomCss( ev.target.value, { history: { propDisplayName: 'Custom CSS' } } )
				}
				multiline
			/>
		</SectionContent>
	);
};
