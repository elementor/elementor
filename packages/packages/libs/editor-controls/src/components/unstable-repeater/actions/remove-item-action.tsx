import * as React from 'react';
import { XIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const SIZE = 'tiny';

export const RemoveItemAction = () => {
	const removeLabel = __( 'Remove', 'elementor' );
	const removeItem = () => {};

	return (
		<Tooltip title={ removeLabel } placement="top">
			<IconButton size={ SIZE } onClick={ removeItem } aria-label={ removeLabel }>
				<XIcon fontSize={ SIZE } />
			</IconButton>
		</Tooltip>
	);
};
