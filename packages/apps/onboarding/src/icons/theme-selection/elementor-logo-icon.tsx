import * as React from 'react';
import { SvgIcon, useTheme } from '@elementor/ui';

const ElementorLogoIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >( ( props, ref ) => {
	const theme = useTheme();

	return (
		<SvgIcon viewBox="0 0 32 32" { ...props } ref={ ref } width="32" height="32">
			<circle cx="16" cy="16" r="16" fill={ theme.palette.text.disabled } />
			<path
				d="M11.15 24H7.97V8h3.18v16zm12.74 0h-9.56v-3.2h9.56V24zm0-6.4h-9.56v-3.2h9.56v3.2zm0-6.4h-9.56V8h9.56v3.2z"
				fill={ theme.palette.common.white }
			/>
		</SvgIcon>
	);
} );

export default ElementorLogoIcon;
