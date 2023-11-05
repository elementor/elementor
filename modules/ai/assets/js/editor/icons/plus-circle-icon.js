import React from 'react';
import { SvgIcon } from '@elementor/ui';

const PlusCircleIcon = React.forwardRef( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 24 24" { ...props } ref={ ref }>
			<path fillRule="evenodd" clipRule="evenodd" d="M12.0005 4C7.58221 4 4.00049 7.58172 4.00049 12C4.00049 16.4183 7.58221 20 12.0005 20C16.4188 20 20.0005 16.4183 20.0005 12C20.0005 7.58172 16.4188 4 12.0005 4ZM2.00049 12C2.00049 6.47715 6.47764 2 12.0005 2C17.5233 2 22.0005 6.47715 22.0005 12C22.0005 17.5228 17.5233 22 12.0005 22C6.47764 22 2.00049 17.5228 2.00049 12Z" fill="#3A3F45" />
			<path fillRule="evenodd" clipRule="evenodd" d="M8.00049 12C8.00049 11.4477 8.4482 11 9.00049 11H15.0005C15.5528 11 16.0005 11.4477 16.0005 12C16.0005 12.5523 15.5528 13 15.0005 13H9.00049C8.4482 13 8.00049 12.5523 8.00049 12Z" fill="#3A3F45" />
			<path fillRule="evenodd" clipRule="evenodd" d="M12.0005 8C12.5528 8 13.0005 8.44772 13.0005 9V15C13.0005 15.5523 12.5528 16 12.0005 16C11.4482 16 11.0005 15.5523 11.0005 15V9C11.0005 8.44772 11.4482 8 12.0005 8Z" fill="#3A3F45" />
		</SvgIcon>
	);
} );

export default PlusCircleIcon;
