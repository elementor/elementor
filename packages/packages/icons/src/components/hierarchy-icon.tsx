import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@elementor/ui';

const HierarchyIcon = React.forwardRef( ( props: SvgIconProps, ref ) => {
	return (
		<SvgIcon viewBox="0 0 24 24" { ...props } ref={ ref } sx={ {
			fill: 'none',
			stroke: 'currentColor',
			strokeWidth: 1.5,
			strokeLinejoin: 'round',
			strokeLinecap: 'round',
			...props.sx,
		} }>
			<path stroke="none" d="M0 0h24v24H0z" />
			<path d="M10 3h4v4h-4z" />
			<path d="M3 17h4v4h-4z" />
			<path d="M17 17h4v4h-4z" />
			<path d="M7 17l5 -4l5 4" />
			<line x1="12" y1="7" x2="12" y2="13" />
		</SvgIcon>
	);
} );

export default HierarchyIcon;
