import * as React from 'react';
import { SvgIcon, useTheme } from '@elementor/ui';

const ElementorBoxIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >( ( props, ref ) => {
	const theme = useTheme();

	return (
		<SvgIcon viewBox="0 0 120 120" { ...props } ref={ ref } width="120" height="120">
			<rect
				x="0.5"
				y="0.5"
				width="119"
				height="119"
				rx="12"
				fill={ theme.palette.action.hover }
				stroke={ theme.palette.divider }
				strokeWidth="1"
				strokeDasharray="6 4"
			/>
			<g transform="translate(44, 44)">
				<circle cx="16" cy="16" r="16" fill={ theme.palette.text.disabled } />
				<path
					d="M11.15 24H7.97V8h3.18v16zm12.74 0h-9.56v-3.2h9.56V24zm0-6.4h-9.56v-3.2h9.56v3.2zm0-6.4h-9.56V8h9.56v3.2z"
					fill={ theme.palette.common.white }
				/>
			</g>
		</SvgIcon>
	);
} );

export default ElementorBoxIcon;
