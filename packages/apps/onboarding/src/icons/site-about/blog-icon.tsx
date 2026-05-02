import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const BlogIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 32 32" { ...props } ref={ ref } width="32" height="32">
			<path
				d="M26 19V15.5C26 14.3065 25.5259 13.1619 24.682 12.318C23.8381 11.4741 22.6935 11 21.5 11H19.5C19.1022 11 18.7206 10.842 18.4393 10.5607C18.158 10.2794 18 9.89782 18 9.5V7.5C18 6.30653 17.5259 5.16193 16.682 4.31802C15.8381 3.47411 14.6935 3 13.5 3H11M11 20H21M11 24H16M14 3H7.5C6.672 3 6 3.672 6 4.5V27.5C6 28.328 6.672 29 7.5 29H24.5C25.328 29 26 28.328 26 27.5V15C26 11.8174 24.7357 8.76516 22.4853 6.51472C20.2348 4.26428 17.1826 3 14 3Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</SvgIcon>
	);
} );

export default BlogIcon;
