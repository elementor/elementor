import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@elementor/ui';

const WidescreenIcon = React.forwardRef( ( props: SvgIconProps, ref ) => {
	return (
		<SvgIcon viewBox="0 0 24 24" { ...props } ref={ ref }>
			<path fillRule="evenodd" clipRule="evenodd" d="M3 5.25C2.86193 5.25 2.75 5.36193 2.75 5.5V15.5C2.75 15.6381 2.86193 15.75 3 15.75H21C21.1381 15.75 21.25 15.6381 21.25 15.5V5.5C21.25 5.36193 21.1381 5.25 21 5.25H3ZM1.25 5.5C1.25 4.5335 2.0335 3.75 3 3.75H21C21.9665 3.75 22.75 4.5335 22.75 5.5V15.5C22.75 16.4665 21.9665 17.25 21 17.25H3C2.0335 17.25 1.25 16.4665 1.25 15.5V5.5ZM6.25 19.5C6.25 19.0858 6.58579 18.75 7 18.75H17C17.4142 18.75 17.75 19.0858 17.75 19.5C17.75 19.9142 17.4142 20.25 17 20.25H7C6.58579 20.25 6.25 19.9142 6.25 19.5Z" />
		</SvgIcon>
	);
} );

export default WidescreenIcon;
