import * as React from 'react';
import { CopyIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useRepeaterContext } from '../context/repeater-context';

const SIZE = 'tiny';

export const DuplicateItemAction = () => {
	const { items, addItem, index } = useRepeaterContext();

	if ( index === -1 ) {
		return null;
	}

	const duplicateLabel = __( 'Duplicate', 'elementor' );

	const onClick = ( ev: React.MouseEvent ) => {
		const newItem = structuredClone( items[ index ]?.item );

		addItem( ev, { item: newItem, index: index + 1 } );
	};

	return (
		<Tooltip title={ duplicateLabel } placement="top">
			<IconButton size={ SIZE } onClick={ onClick } aria-label={ duplicateLabel }>
				<CopyIcon fontSize={ SIZE } />
			</IconButton>
		</Tooltip>
	);
};
