import * as React from 'react';
import { PostTypeIcon } from '@elementor/icons';
import { Chip } from '@elementor/ui';

import { getIconsMap } from '../../icons-map';

const iconsMap = getIconsMap();

type Props = {
	postType: string;
	docType: string;
	label: string;
};

export default function DocTypeChip( { postType, docType, label }: Props ) {
	const color = 'elementor_library' === postType ? 'global' : 'primary';
	const Icon = iconsMap[ docType ] || PostTypeIcon;

	return (
		<Chip
			component="span"
			size="small"
			variant="outlined"
			label={ label }
			data-value={ docType }
			color={ color }
			icon={ <Icon /> }
			sx={ { ml: 1, cursor: 'inherit' } }
		/>
	);
}
