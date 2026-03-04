import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const ImageOptimizationIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >(
	( props, ref ) => {
		return (
			<SvgIcon viewBox="0 0 32 32" { ...props } ref={ ref } width="32" height="32">
				<rect
					x="4.59961"
					y="4.60156"
					width="22.8"
					height="22.8"
					rx="4.56"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
				/>
				<path
					d="M5.74023 26.2611L11.8306 18.6481C12.2446 18.1306 12.9998 18.0467 13.5173 18.4607L17.3432 21.5215C17.8607 21.9355 18.6159 21.8516 19.0299 21.3341L27.4002 10.8711"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
				/>
				<circle cx="10.4802" cy="10.4792" r="2.28" fill="none" stroke="currentColor" strokeWidth="1.5" />
			</SvgIcon>
		);
	}
);

export default ImageOptimizationIcon;
