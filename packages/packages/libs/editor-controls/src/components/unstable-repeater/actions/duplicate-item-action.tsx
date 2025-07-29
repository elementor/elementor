import * as React from 'react';
import { CopyIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useRepeaterContext } from '../context/repeater-context';

const SIZE = 'tiny';

export const DuplicateItemAction = () => {
	const {
		config: {
			itemActions: { inject },
		},
	} = useRepeaterContext();

	inject( Action, 'duplicate' );

	return null;
};

const Action = ( { index }: { index: number } ) => {
	const { items, addItem } = useRepeaterContext();
	const duplicateLabel = __( 'Duplicate', 'elementor' );

	const onClick = () => {
		const newItem = structuredClone( items[ index ] );

		addItem( newItem, index + 1 );
	};

	return (
		<Tooltip title={ duplicateLabel } placement="top">
			<IconButton size={ SIZE } onClick={ onClick } aria-label={ duplicateLabel }>
				<CopyIcon fontSize={ SIZE } />
			</IconButton>
		</Tooltip>
	);
};
