import * as React from 'react';
import { SvgIcon, SvgIconProps } from '@elementor/ui';

const SearchIcon = React.forwardRef( ( props: SvgIconProps, ref ) => {
	return (
		<SvgIcon viewBox="0 0 24 24" { ...props } ref={ ref }>
			<path fillRule="evenodd" clipRule="evenodd" d="M10 3.75C6.54822 3.75 3.75 6.54822 3.75 10C3.75 13.4518 6.54822 16.25 10 16.25C13.4518 16.25 16.25 13.4518 16.25 10C16.25 6.54822 13.4518 3.75 10 3.75ZM2.25 10C2.25 5.71979 5.71979 2.25 10 2.25C14.2802 2.25 17.75 5.71979 17.75 10C17.75 11.87 17.0877 13.5853 15.9848 14.9242L21.5303 20.4697C21.8232 20.7626 21.8232 21.2374 21.5303 21.5303C21.2374 21.8232 20.7626 21.8232 20.4697 21.5303L14.9242 15.9848C13.5853 17.0877 11.87 17.75 10 17.75C5.71979 17.75 2.25 14.2802 2.25 10Z" />
		</SvgIcon>
	);
} );

export default SearchIcon;
