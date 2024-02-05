import React from 'react';
import { SvgIcon } from '@elementor/ui';

const RestoreIcon = React.forwardRef( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 24 24" { ...props } ref={ ref }>
			<path fillRule="evenodd" d="M11.913 3.22a8.781 8.781 0 0 1 3.367.634.75.75 0 1 1-.56 1.392A7.281 7.281 0 0 0 8.25 18.24V15a.75.75 0 0 1 1.5 0v4.433a.73.73 0 0 1 0 .034V20a.75.75 0 0 1-.75.75H4a.75.75 0 0 1 0-1.5h3.045a8.782 8.782 0 0 1 4.868-16.03ZM18.37 6.41a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-1.5 0v-.01a.75.75 0 0 1 .75-.75ZM13 19.19a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-1.5 0v-.01a.75.75 0 0 1 .75-.75ZM16.84 17.62a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-1.5 0v-.01a.75.75 0 0 1 .75-.75ZM19.37 14.35a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-1.5 0v-.01a.75.75 0 0 1 .75-.75ZM19.94 10.25a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-1.5 0V11a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
		</SvgIcon>
	);
} );

export default RestoreIcon;
