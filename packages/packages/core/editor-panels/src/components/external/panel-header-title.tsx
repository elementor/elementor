import * as React from 'react';
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

export default function PanelHeaderTitle( { children, ...props }: TypographyProps ) {
	return (
		<Typography component="h2" variant="subtitle1" { ...props }>
			{ children }
		</Typography>
	);
}
