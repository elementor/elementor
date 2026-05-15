import * as React from 'react';
import { SvgIcon } from '@elementor/ui';

const ArrowRightIcon = ( props ) => {
	return (
		<SvgIcon viewBox="0 0 24 24" { ...props }>
			<path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" />
		</SvgIcon>
	);
};

export default ArrowRightIcon;
