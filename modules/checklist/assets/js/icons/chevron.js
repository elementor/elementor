import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const ChevronIcon = ( props ) => {
	return (
		<SvgIcon viewBox="0 0 24 24" { ...props }>
			<path fillRule="evenodd" clipRule="evenodd" d="M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z" />
		</SvgIcon>
	);
};

export default ChevronIcon;
