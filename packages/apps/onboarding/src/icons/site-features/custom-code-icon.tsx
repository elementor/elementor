import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const CustomCodeIcon = React.forwardRef<SVGSVGElement, React.ComponentProps<typeof SvgIcon>>((props, ref) => {
	return (
		<SvgIcon viewBox="0 0 32 32" {...props} ref={ref} width="32" height="32">
			<path
				d="M9.33333 10.666L4 15.9993L9.33333 21.3327"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M22.667 10.666L28.0003 15.9993L22.667 21.3327"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M18.6663 5.33301L13.333 26.6663"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</SvgIcon>
	);
});

export default CustomCodeIcon;
