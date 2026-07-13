import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const HelloThemeIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 32 32" { ...props } ref={ ref } width="32" height="32">
			<rect
				x="4"
				y="4"
				width="24"
				height="24"
				rx="1.25"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<path
				d="M12 11.75V21.36M20 11.75V21.36M4 11.22H28M4 20.82H28"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
		</SvgIcon>
	);
} );

export default HelloThemeIcon;
