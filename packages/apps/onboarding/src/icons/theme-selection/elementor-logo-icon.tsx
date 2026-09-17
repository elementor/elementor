import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const ElementorLogoIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 44 44" { ...props } ref={ ref }>
			<circle cx="22" cy="22" r="22" fill="#ffffff" />
			<path
				d="M22 0C9.85 0 0 9.85 0 22s9.85 22 22 22 22-9.85 22-22S34.15 0 22 0ZM15.4 33H11V11h4.4v22Zm17.6 0H19.8v-4.4H33V33Zm0-8.8H19.8v-4.4H33v4.4Zm0-8.8H19.8V11H33v4.4Z"
				fill="#515962"
				fillOpacity="0.38"
			/>
		</SvgIcon>
	);
} );

export default ElementorLogoIcon;
