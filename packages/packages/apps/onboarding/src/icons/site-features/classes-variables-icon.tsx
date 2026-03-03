import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const ClassesVariablesIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 26 26" { ...props } ref={ ref } width="26" height="26">
			<path
				d="M3.41667 0.75H8.75C9.45724 0.75 10.1355 1.03095 10.6356 1.53105C11.1357 2.03115 11.4167 2.70942 11.4167 3.41667V19.4167C11.4167 20.8312 10.8548 22.1877 9.85457 23.1879C8.85438 24.1881 7.49782 24.75 6.08333 24.75C4.66885 24.75 3.31229 24.1881 2.3121 23.1879C1.3119 22.1877 0.75 20.8312 0.75 19.4167V3.41667C0.75 2.70942 1.03095 2.03115 1.53105 1.53105C2.03115 1.03095 2.70942 0.75 3.41667 0.75Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M11.417 6.5529L14.0837 3.88623C14.5837 3.38631 15.2619 3.10547 15.969 3.10547C16.6761 3.10547 17.3543 3.38631 17.8543 3.88623L21.625 7.6569C22.1249 8.15697 22.4058 8.83513 22.4058 9.54223C22.4058 10.2493 22.1249 10.9275 21.625 11.4276L9.625 23.4276"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M19.0167 14.082H22.0833C22.7906 14.082 23.4689 14.363 23.969 14.8631C24.469 15.3632 24.75 16.0415 24.75 16.7487V22.082C24.75 22.7893 24.469 23.4676 23.969 23.9676C23.4689 24.4677 22.7906 24.7487 22.0833 24.7487H6.08333"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M6.0835 19.418V19.4313"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</SvgIcon>
	);
} );

export default ClassesVariablesIcon;
