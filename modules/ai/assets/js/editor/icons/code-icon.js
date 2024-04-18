import React from 'react';
import { SvgIcon } from '@elementor/ui';

const CodeIcon = React.forwardRef( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 24 24" { ...props } ref={ ref }>
			<path fillRule="evenodd" d="M7.53 7.47a.75.75 0 0 1 0 1.06L4.06 12l3.47 3.47a.75.75 0 1 1-1.06 1.06l-4-4a.75.75 0 0 1 0-1.06l4-4a.75.75 0 0 1 1.06 0ZM16.47 7.47a.75.75 0 0 1 1.06 0l4 4a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 1 1-1.06-1.06L19.94 12l-3.47-3.47a.75.75 0 0 1 0-1.06ZM14.182 3.272a.75.75 0 0 1 .546.91l-4 16a.75.75 0 0 1-1.456-.364l4-16a.75.75 0 0 1 .91-.546Z" clipRule="evenodd" />
		</SvgIcon>
	);
} );

export default CodeIcon;
