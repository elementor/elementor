import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@elementor/ui';

const PlusIcon: React.FC<SvgIconProps> = ( props ) => {
	return (
		<SvgIcon viewBox="0 0 24 24" sx={ { fill: '#fff' } } { ...props }>
			<path d="M11 4.75C11 4.33579 11.3358 4 11.75 4C12.1642 4 12.5 4.33579 12.5 4.75V11H18.75C19.1642 11 19.5 11.3358 19.5 11.75C19.5 12.1642 19.1642 12.5 18.75 12.5H12.5V18.75C12.5 19.1642 12.1642 19.5 11.75 19.5C11.3358 19.5 11 19.1642 11 18.75V12.5H4.75C4.33579 12.5 4 12.1642 4 11.75C4 11.3358 4.33579 11 4.75 11H11V4.75Z" />
		</SvgIcon>
	);
};

export default PlusIcon;
