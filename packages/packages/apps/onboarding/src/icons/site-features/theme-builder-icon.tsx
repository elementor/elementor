import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const ThemeBuilderIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 25 25" { ...props } ref={ ref } width="25" height="25">
			<path
				d="M0.75 2.1875C0.75 1.80625 0.901451 1.44062 1.17103 1.17103C1.44062 0.901451 1.80625 0.75 2.1875 0.75H22.3125C22.6937 0.75 23.0594 0.901451 23.329 1.17103C23.5986 1.44062 23.75 1.80625 23.75 2.1875V5.0625C23.75 5.44375 23.5986 5.80938 23.329 6.07897C23.0594 6.34855 22.6937 6.5 22.3125 6.5H2.1875C1.80625 6.5 1.44062 6.34855 1.17103 6.07897C0.901451 5.80938 0.75 5.44375 0.75 5.0625V2.1875Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M0.75 13.6875C0.75 13.3063 0.901451 12.9406 1.17103 12.671C1.44062 12.4015 1.80625 12.25 2.1875 12.25H7.9375C8.31875 12.25 8.68438 12.4015 8.95397 12.671C9.22355 12.9406 9.375 13.3063 9.375 13.6875V22.3125C9.375 22.6937 9.22355 23.0594 8.95397 23.329C8.68438 23.5986 8.31875 23.75 7.9375 23.75H2.1875C1.80625 23.75 1.44062 23.5986 1.17103 23.329C0.901451 23.0594 0.75 22.6937 0.75 22.3125V13.6875Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M15.125 12.25H23.75"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M15.125 18H23.75"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M15.125 23.75H23.75"
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
