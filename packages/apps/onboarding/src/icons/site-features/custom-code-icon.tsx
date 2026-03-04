import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const CustomCodeIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 26 23" { ...props } ref={ ref } width="26" height="23">
			<path
				d="M6.08333 6.08351L0.75 11.4168L6.08333 16.7502"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M19.4167 6.08351L24.75 11.4168L19.4167 16.7502"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M15.4167 0.750177L10.0833 22.0835"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</SvgIcon>
	);
} );

export default CustomCodeIcon;
