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
	const { items, setItems, uniqueKeys, setUniqueKeys } = useRepeaterContext();
	const duplicateLabel = __( 'Duplicate', 'elementor' );

	const onClick = () => {
		const self = items?.[ index ];

		if ( ! self ) {
			return;
		}

		const newItem = structuredClone( self );
		const newItems = [ ...items ];
		const newKey = uniqueKeys.length;

		newItems.splice( index + 1, 0, newItem );

		setItems( newItems );
		setUniqueKeys( [ ...uniqueKeys, newKey ] );
	};

	return (
		<Tooltip title={ duplicateLabel } placement="top">
			<IconButton size={ SIZE } onClick={ onClick } aria-label={ duplicateLabel }>
				<CopyIcon fontSize={ SIZE } />
			</IconButton>
		</Tooltip>
	);
};
