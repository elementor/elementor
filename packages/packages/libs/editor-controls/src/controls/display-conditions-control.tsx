import * as React from 'react';
import { SitemapIcon } from '@elementor/icons';
import { IconButton, Stack, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { createControl } from '../create-control';

export const DisplayConditionsControl = createControl( () => {
	const ariaLabel = __( 'Display Conditions', 'elementor' );

	return (
		<Stack
			direction="row"
			sx={ {
				justifyContent: 'flex-end',
			} }
		>
			<Tooltip title={ ariaLabel } placement="top">
				<IconButton aria-label={ ariaLabel }>
					<SitemapIcon fontSize="tiny" />
				</IconButton>
			</Tooltip>
		</Stack>
	);
} );
