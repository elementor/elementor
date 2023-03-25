import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@elementor/ui';

const ChevronDownIcon = React.forwardRef( ( props: SvgIconProps, ref ) => {
	return (
		<SvgIcon viewBox="0 0 24 24" { ...props } ref={ ref }>
			<path fillRule="evenodd" clipRule="evenodd" d="M5.46967 9.21967C5.76256 8.92678 6.23744 8.92678 6.53033 9.21967L12 14.6893L17.4697 9.21967C17.7626 8.92678 18.2374 8.92678 18.5303 9.21967C18.8232 9.51256 18.8232 9.98744 18.5303 10.2803L12.5303 16.2803C12.2374 16.5732 11.7626 16.5732 11.4697 16.2803L5.46967 10.2803C5.17678 9.98744 5.17678 9.51256 5.46967 9.21967Z" />
		</SvgIcon>
	);
} );

export default ChevronDownIcon;
