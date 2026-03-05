import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const OtherIcon = React.forwardRef<SVGSVGElement, React.ComponentProps<typeof SvgIcon>>((props, ref) => {
	return (
		<SvgIcon viewBox="0 0 32 32" {...props} ref={ref} width="32" height="32">
			<path
				d="M28 28L21.0707 21.0707M21.0707 21.0707C22.9461 19.1952 23.9997 16.6516 23.9997 13.9993C23.9997 11.3471 22.9461 8.80343 21.0707 6.928C19.1952 5.05257 16.6516 3.99896 13.9993 3.99896C11.3471 3.99896 8.80343 5.05257 6.928 6.928C5.05257 8.80343 3.99896 11.3471 3.99896 13.9993C3.99896 16.6516 5.05257 19.1952 6.928 21.0707C8.80343 22.9461 11.3471 23.9997 13.9993 23.9997C16.6516 23.9997 19.1952 22.9461 21.0707 21.0707ZM14 10V18M18 14H10"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</SvgIcon>
	);
});

export default OtherIcon;
