import * as React from 'react';
import { CopyIcon } from '@elementor/icons';
import { Button, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const InteractionsTab = () => {
	const handleCreateInteraction = () => {};

	return (
		<Stack
			alignItems="center"
			justifyContent="center"
			height="100%"
			color="text.secondary"
			sx={ { p: 2.5, pt: 8, pb: 5.5 } }
			gap={ 1.5 }
		>
			<CopyIcon fontSize="large" />

			<Typography align="center" variant="subtitle2">
				{ __( 'Animate elements with Interactions', 'elementor' ) }
			</Typography>

			<Typography align="center" variant="caption" maxWidth="170px">
				{ __(
					'Add entrance animations and effects triggered by user interactions such as click, hover, or scroll.',
					'elementor'
				) }
			</Typography>

			<Button
				variant="outlined"
				color="secondary"
				size="small"
				onClick={ handleCreateInteraction }
				sx={ { mt: 1 } }
			>
				{ __( 'Create an interaction', 'elementor' ) }
			</Button>
		</Stack>
	);
};
