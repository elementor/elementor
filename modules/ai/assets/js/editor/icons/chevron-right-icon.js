import React from 'react';
import { SvgIcon } from '@elementor/ui';

const ChevronRightIcon = React.forwardRef( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 24 24" { ...props } ref={ ref }>
			<path fillRule="evenodd" clipRule="evenodd" d="M8.46967 18.2803C8.17678 17.9874 8.17678 17.5126 8.46967 17.2197L13.9393 11.75L8.46967 6.28033C8.17678 5.98744 8.17678 5.51256 8.46967 5.21967C8.76256 4.92678 9.23744 4.92678 9.53033 5.21967L15.5303 11.2197C15.8232 11.5126 15.8232 11.9874 15.5303 12.2803L9.53033 18.2803C9.23744 18.5732 8.76256 18.5732 8.46967 18.2803Z" />
		</SvgIcon>
	);
} );

export default ChevronRightIcon;
