import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const CookieConsentIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 32 32" { ...props } ref={ ref } width="32" height="32">
			<circle cx="14.56" cy="12.317" r="2.16" fill="none" stroke="currentColor" strokeWidth="1.5" />
			<circle cx="11.801" cy="19.158" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
			<circle cx="19.96" cy="19.96" r="1.56" fill="none" stroke="currentColor" strokeWidth="1.5" />
			<path
				d="M16 3.999C16.19 3.999 16.378 4.004 16.566 4.013C17.055 4.037 17.446 4.395 17.654 4.838C18.421 6.47 20.078 7.599 22 7.599C22.609 7.599 23.2 8.19 23.2 8.799C23.2 11.049 24.748 12.938 26.837 13.458C27.369 13.59 27.84 13.969 27.908 14.513C27.969 15 28 15.496 28 16C28 22.627 22.628 28 16 28C9.372 28 4 22.627 4 16C4.001 9.372 9.373 3.999 16 3.999Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
		</SvgIcon>
	);
} );

export default CookieConsentIcon;
