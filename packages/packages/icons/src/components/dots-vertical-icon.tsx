import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@elementor/ui';

const DotsVerticalIcon = React.forwardRef( ( props: SvgIconProps, ref ) => {
	return (
		<SvgIcon viewBox="0 0 24 24" { ...props } ref={ ref }>
			<path d="M6.90002 11.75C6.90002 12.5784 6.22845 13.25 5.40002 13.25C4.5716 13.25 3.90002 12.5784 3.90002 11.75C3.90002 10.9216 4.5716 10.25 5.40002 10.25C6.22845 10.25 6.90002 10.9216 6.90002 11.75Z" />
			<path d="M13.5 11.75C13.5 12.5784 12.8285 13.25 12 13.25C11.1716 13.25 10.5 12.5784 10.5 11.75C10.5 10.9216 11.1716 10.25 12 10.25C12.8285 10.25 13.5 10.9216 13.5 11.75Z" />
			<path d="M20.1 11.75C20.1 12.5784 19.4285 13.25 18.6 13.25C17.7716 13.25 17.1 12.5784 17.1 11.75C17.1 10.9216 17.7716 10.25 18.6 10.25C19.4285 10.25 20.1 10.9216 20.1 11.75Z" />
		</SvgIcon>
	);
} );

export default DotsVerticalIcon;
