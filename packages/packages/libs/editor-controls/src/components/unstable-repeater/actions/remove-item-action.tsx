import * as React from 'react';
import { XIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useRepeaterContext } from '../context/repeater-context';

const SIZE = 'tiny';

export const RemoveItemAction = () => {
	const {
		config: {
			itemActions: { inject },
		},
	} = useRepeaterContext();

	inject( Action, 'remove' );

	return null;
};

const Action = ( { index }: { index: number } ) => {
	const { items, setItems, uniqueKeys, setUniqueKeys } = useRepeaterContext();
	const removeLabel = __( 'Remove', 'elementor' );

	const onClick = () => {
		const self = items?.[ index ];

		if ( ! self ) {
			return;
		}

		setItems( items.filter( ( _, itemIndex ) => itemIndex !== index ) );
		setUniqueKeys( uniqueKeys.slice( 0, -1 ) );
	};

	return (
		<Tooltip title={ removeLabel } placement="top">
			<IconButton size={ SIZE } onClick={ onClick } aria-label={ removeLabel }>
				<XIcon fontSize={ SIZE } />
			</IconButton>
		</Tooltip>
	);
};
