import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const HelloThemeIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 32 32" { ...props } ref={ ref } width="32" height="32">
			<rect
				x="0.75"
				y="0.75"
				width="30.5"
				height="30.5"
				rx="2.56"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<path
				d="M1.5 11.17H30.5M1.5 20.83H30.5"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<path
				d="M11.17 11.17V20.83M20.83 11.17V20.83"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
		</SvgIcon>
	);
} );

export default HelloThemeIcon;
