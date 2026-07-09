import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const PlusIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >( ( props, ref ) => {
	return (
		<SvgIcon viewBox="-3 -3 40 40" { ...props } ref={ ref }>
			<path
				d="M20.727 2.727C21.832 2.727 22.727 3.623 22.727 4.727V11.817H29.818C30.923 11.817 31.818 12.713 31.818 13.817V20.726C31.818 21.831 30.923 22.726 29.818 22.726H22.727V29.818C22.727 30.923 21.832 31.818 20.727 31.818H13.818C12.714 31.818 11.818 30.923 11.818 29.818V22.726H4.727C3.623 22.726 2.727 21.831 2.727 20.726V13.817C2.727 12.713 3.623 11.817 4.727 11.817H11.818V4.727C11.818 3.623 12.714 2.727 13.818 2.727H20.727Z"
				fill="currentColor"
				stroke="#ffffff"
				strokeWidth="2.727"
				strokeLinejoin="round"
			/>
		</SvgIcon>
	);
} );

export default PlusIcon;
