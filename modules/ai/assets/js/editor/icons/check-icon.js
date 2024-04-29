import React from 'react';
import { SvgIcon } from '@elementor/ui';

const CheckIcon = React.forwardRef( ( props, ref ) => {
	return (
		<SvgIcon viewBox="0 0 24 24" { ...props } ref={ ref }>
			<path d="M7.32923 13.2291L3.85423 9.75414L2.6709 10.9291L7.32923 15.5875L17.3292 5.58748L16.1542 4.41248L7.32923 13.2291Z" fill="#C00BB9" />
		</SvgIcon>
	);
} );

export default CheckIcon;
