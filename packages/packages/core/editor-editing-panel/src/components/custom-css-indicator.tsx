import * as React from 'react';
import { StyleIndicator, useCustomCss } from '@elementor/editor-editing-panel';

export const CustomCssIndicator = () => {
	const { customCss } = useCustomCss();

	const hasContent = Boolean( customCss?.raw?.trim() );

	if ( ! hasContent ) {
		return null;
	}

	return <StyleIndicator getColor={ ( theme ) => theme.palette.accent.main } />;
};
