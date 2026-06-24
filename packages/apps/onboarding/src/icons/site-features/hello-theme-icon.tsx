import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const HelloThemeIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 32 32" { ...props } ref={ ref } width="32" height="32">
			<path
				d="M6 4.5h20A1.5 1.5 0 0 1 27.5 6v20a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 26V6A1.5 1.5 0 0 1 6 4.5Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M11 10v12M11 16h5v6M16 10v6M21 10v12"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</SvgIcon>
	);
} );

export default HelloThemeIcon;
