import React from 'react';
import { SvgIcon } from '@elementor/ui';

const TextIcon = React.forwardRef( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 24 24" { ...props } ref={ ref }>
			<path fillRule="evenodd" d="M4.25 5A.75.75 0 0 1 5 4.25h14a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-1.5 0V5.75H5.75V7a.75.75 0 0 1-1.5 0V5Z" clipRule="evenodd" />
			<path fillRule="evenodd" d="M12 4.25a.75.75 0 0 1 .75.75v14a.75.75 0 0 1-1.5 0V5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
			<path fillRule="evenodd" d="M9.25 19a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
		</SvgIcon>
	);
} );

export default TextIcon;
