import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@elementor/ui';

export default function ArrowUpLeftIcon( props: SvgIconProps ) {
	return (
		<SvgIcon viewBox="0 0 16 16" { ...props } sx={ { stroke: 'currentColor', ...props.sx } }>
			<path xmlns="http://www.w3.org/2000/svg" d="M4.66671 4.6665L11.3334 11.3332M4.66671 4.6665H10.6667M4.66671 4.6665V10.6665" strokeLinecap="round" strokeLinejoin="round" />
		</SvgIcon>
	);
}
