import * as React from 'react';

import { useCustomCss } from '../hooks/use-custom-css';
import { StyleIndicator } from './style-indicator';

export const CustomCssIndicator = () => {
	const { customCss } = useCustomCss();

	const hasContent = Boolean( customCss?.raw?.trim() );

	if ( ! hasContent ) {
		return null;
	}

	return <StyleIndicator getColor={ ( theme ) => theme.palette.accent.main } />;
};
