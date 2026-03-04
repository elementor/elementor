import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const ExploreMoreIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 24 24" { ...props } ref={ ref } width="24" height="24">
			<path
				d="M6.74805 3.75L12.748 9.75L6.74805 15.75"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</SvgIcon>
	);
} );

export default ExploreMoreIcon;
