import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const PlusIcon = React.forwardRef< SVGSVGElement, React.ComponentProps< typeof SvgIcon > >( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 16 16" { ...props } ref={ ref } width="16" height="16">
			<path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
		</SvgIcon>
	);
} );

export default PlusIcon;
