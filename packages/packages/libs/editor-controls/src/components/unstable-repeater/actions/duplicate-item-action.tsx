import * as React from 'react';
import { CopyIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const SIZE = 'tiny';

export const DuplicateItemAction = () => {
	const duplicateLabel = __( 'Duplicate', 'elementor' );

	return (
		<Tooltip title={ duplicateLabel } placement="top">
			<IconButton size={ SIZE } onClick={ () => {} } aria-label={ duplicateLabel }>
				<CopyIcon fontSize={ SIZE } />
			</IconButton>
		</Tooltip>
	);
};
