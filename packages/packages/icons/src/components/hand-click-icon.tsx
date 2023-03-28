import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@elementor/ui';

const HandClickIcon = React.forwardRef( ( props: SvgIconProps, ref ) => {
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
			<path d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5" />
			<path d="M11 11.5v-2a1.5 1.5 0 0 1 3 0v2.5" />
			<path d="M14 10.5a1.5 1.5 0 0 1 3 0v1.5" />
			<path d="M17 11.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7l-.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47" />
			<path d="M5 3l-1 -1" />
			<path d="M4 7h-1" />
			<path d="M14 3l1 -1" />
			<path d="M15 6h1" />
		</SvgIcon>
	);
} );

export default HandClickIcon;
