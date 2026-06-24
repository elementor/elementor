import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const CookieConsentIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 32 32" { ...props } ref={ ref } width="32" height="32">
			<path
				d="M16 4.5a11.5 11.5 0 1 0 11.5 11.5 4.5 4.5 0 0 1-5-5 4.5 4.5 0 0 1-5-5A11.5 11.5 0 0 0 16 4.5Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<circle cx="11.5" cy="14" r="1.25" fill="currentColor" />
			<circle cx="15.5" cy="20" r="1.25" fill="currentColor" />
			<circle cx="20.5" cy="17" r="1.25" fill="currentColor" />
			<circle cx="11" cy="20" r="1" fill="currentColor" />
		</SvgIcon>
	);
} );

export default CookieConsentIcon;
