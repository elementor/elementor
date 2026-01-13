import * as React from 'react';
import { forwardRef } from 'react';
import { styled, Typography as TypographySource, type TypographyProps } from '@elementor/ui';

// This is to override Editor reset.scss that overrides eui styles
const Typography = styled( TypographySource )< TypographyProps >( ( { theme, variant = 'body1' } ) => {
	if ( variant === 'inherit' ) {
		return {};
	}

	return {
		'&.MuiTypography-root': {
			...theme.typography[ variant ],
		},
	};
} );

const PanelHeaderTitle = forwardRef< HTMLHeadingElement, TypographyProps >( ( { children, ...props }, ref ) => {
	return (
		<Typography ref={ ref } component="h2" variant="subtitle1" { ...props }>
			{ children }
		</Typography>
	);
} );

export default PanelHeaderTitle;
