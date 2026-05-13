import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const CompanySiteIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 32 32" { ...props } ref={ ref } width="32" height="32">
			<path
				d="M5 28H27M6 4H26M7 4V28M25 4V28M12 9H14M12 13H14M12 17H14M18 9H20M18 13H20M18 17H20M12 28V23.5C12 22.672 12.672 22 13.5 22H18.5C19.328 22 20 22.672 20 23.5V28"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</SvgIcon>
	);
} );

export default CompanySiteIcon;
