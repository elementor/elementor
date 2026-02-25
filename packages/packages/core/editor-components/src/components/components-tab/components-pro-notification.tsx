import * as React from 'react';
import { InfoAlert } from '@elementor/editor-ui';
import { Box, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export function ComponentsProNotification() {
	return (
		<Box sx={ { px: 2 } }>
			<InfoAlert>
				<Typography variant="caption" component="span">
					<Typography variant="caption" component="span" fontWeight="bold">
						{ __( 'Try Components for free:', 'elementor' ) }
					</Typography>{ ' ' }
					{ __(
						'Soon Components will be part of the Pro subscription, but what you create now will remain on your site.',
						'elementor'
					) }
				</Typography>
			</InfoAlert>
		</Box>
	);
}
