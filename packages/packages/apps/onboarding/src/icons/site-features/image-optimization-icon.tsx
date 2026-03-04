import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const ImageOptimizationIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >(
	( props, ref ) => {
		return (
			<SvgIcon viewBox="0 0 25 25" { ...props } ref={ ref } width="25" height="25">
				<rect
					x="0.75"
					y="0.75"
					width="22.8"
					height="22.8"
					rx="4.56"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
				/>
				<path
					d="M1.89014 22.4095L7.9805 14.7966C8.39451 14.2791 9.14967 14.1952 9.66718 14.6092L13.4931 17.6699C14.0106 18.0839 14.7658 18 15.1798 17.4825L23.5501 7.01953"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
				/>
				<circle cx="6.6301" cy="6.62766" r="2.28" fill="none" stroke="currentColor" strokeWidth="1.5" />
			</SvgIcon>
		);
	}
);

export default ImageOptimizationIcon;
