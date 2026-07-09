import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const HelloThemeIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 32 32" { ...props } ref={ ref } width="32" height="32">
			<rect
				x="4.75"
				y="4.75"
				width="22.5"
				height="22.5"
				rx="1.17"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<path
				d="M12.25 12.021V21.021M19.75 12.021V21.021M4.5 11.518H27.5M4.5 20.518H27.5"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
		</SvgIcon>
	);
} );

export default HelloThemeIcon;
