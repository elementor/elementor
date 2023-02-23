import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@elementor/ui';

const ArrowUpRightIcon = React.forwardRef( ( props: SvgIconProps, ref ) => {
	return (
		<SvgIcon viewBox="0 0 24 24" { ...props } ref={ ref } sx={ { stroke: 'currentColor', ...props.sx } }>
			<path fillRule="evenodd" clipRule="evenodd" d="M7.25 7C7.25 6.58579 7.58579 6.25 8 6.25H17C17.4142 6.25 17.75 6.58579 17.75 7V16C17.75 16.4142 17.4142 16.75 17 16.75C16.5858 16.75 16.25 16.4142 16.25 16V8.81066L7.53033 17.5303C7.23744 17.8232 6.76256 17.8232 6.46967 17.5303C6.17678 17.2374 6.17678 16.7626 6.46967 16.4697L15.1893 7.75H8C7.58579 7.75 7.25 7.41421 7.25 7Z" />
		</SvgIcon>
	);
} );

export default ArrowUpRightIcon;
