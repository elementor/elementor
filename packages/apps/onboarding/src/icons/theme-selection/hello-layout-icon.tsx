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
				d="M3.33 17.11H44.67M3.33 30.89H44.67"
				fill="none"
				stroke="currentColor"
				strokeWidth="3.33"
			/>
			<path
				d="M17.11 17.11V30.89M30.89 17.11V30.89"
				fill="none"
				stroke="currentColor"
				strokeWidth="3.33"
			/>
		</SvgIcon>
	);
} );

export default HelloLayoutIcon;
