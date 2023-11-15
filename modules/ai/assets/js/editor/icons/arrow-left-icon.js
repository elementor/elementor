import React from 'react';
import { SvgIcon } from '@elementor/ui';

const ArrowLeftIcon = React.forwardRef( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 24 24" { ...props } ref={ ref }>
			<path fillRule="evenodd" clipRule="evenodd" d="M9.53033 7.46967C9.82322 7.76256 9.82322 8.23744 9.53033 8.53033L6.81066 11.25H19C19.4142 11.25 19.75 11.5858 19.75 12C19.75 12.4142 19.4142 12.75 19 12.75H6.81066L9.53033 15.4697C9.82322 15.7626 9.82322 16.2374 9.53033 16.5303C9.23744 16.8232 8.76256 16.8232 8.46967 16.5303L4.46967 12.5303C4.17678 12.2374 4.17678 11.7626 4.46967 11.4697L8.46967 7.46967C8.76256 7.17678 9.23744 7.17678 9.53033 7.46967Z" />
		</SvgIcon>
	);
} );

export default ArrowLeftIcon;
