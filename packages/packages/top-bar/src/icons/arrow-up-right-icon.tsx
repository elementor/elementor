import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@elementor/ui';

export default function ArrowUpRightIcon( props: SvgIconProps ) {
	return (
		<SvgIcon viewBox="0 0 16 16" { ...props } sx={ { stroke: 'currentColor', ...props.sx } }>
			<path d="M11.3333 4.66602L4.66663 11.3327M11.3333 4.66602H5.33329M11.3333 4.66602V10.666" strokeLinecap="round" strokeLinejoin="round" />
		</SvgIcon>
	);
}
