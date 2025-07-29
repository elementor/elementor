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
	const { removeItem } = useRepeaterContext();
	const removeLabel = __( 'Remove', 'elementor' );

	const onClick = () => removeItem( index );
	return (
		<Tooltip title={ removeLabel } placement="top">
			<IconButton size={ SIZE } onClick={ onClick } aria-label={ removeLabel }>
				<XIcon fontSize={ SIZE } />
			</IconButton>
		</Tooltip>
	);
};
