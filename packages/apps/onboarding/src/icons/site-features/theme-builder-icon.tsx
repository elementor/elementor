import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const ThemeBuilderIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 32 32" { ...props } ref={ ref } width="32" height="32">
			<path
				d="M4.5 5.9375C4.5 5.55625 4.65145 5.19062 4.92103 4.92103C5.19062 4.65145 5.55625 4.5 5.9375 4.5H26.0625C26.4437 4.5 26.8094 4.65145 27.079 4.92103C27.3486 5.19062 27.5 5.55625 27.5 5.9375V8.8125C27.5 9.19375 27.3486 9.55938 27.079 9.82897C26.8094 10.0985 26.4437 10.25 26.0625 10.25H5.9375C5.55625 10.25 5.19062 10.0985 4.92103 9.82897C4.65145 9.55938 4.5 9.19375 4.5 8.8125V5.9375Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M4.5 17.4375C4.5 17.0563 4.65145 16.6906 4.92103 16.421C5.19062 16.1515 5.55625 16 5.9375 16H11.6875C12.0687 16 12.4344 16.1515 12.704 16.421C12.9735 16.6906 13.125 17.0563 13.125 17.4375V26.0625C13.125 26.4437 12.9735 26.8094 12.704 27.079C12.4344 27.3486 12.0687 27.5 11.6875 27.5H5.9375C5.55625 27.5 5.19062 27.3486 4.92103 27.079C4.65145 26.8094 4.5 26.4437 4.5 26.0625V17.4375Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M18.875 16H27.5"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M18.875 21.75H27.5"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M18.875 27.5H27.5"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</SvgIcon>
	);
} );

export default ThemeBuilderIcon;
