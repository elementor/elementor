import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const HelloLayoutIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 48 48" { ...props } ref={ ref }>
			<rect
				x="1.66"
				y="1.66"
				width="44.68"
				height="44.68"
				rx="3.88"
				ry="3.88"
				fill="none"
				stroke="currentColor"
				strokeWidth="3.33"
			/>
			<path
				d="M1.66 16h44.68M17.33 16v30.34M30.67 16v30.34"
				fill="none"
				stroke="currentColor"
				strokeWidth="3.33"
				strokeLinecap="butt"
			/>
		</SvgIcon>
	);
} );

export default HelloLayoutIcon;
