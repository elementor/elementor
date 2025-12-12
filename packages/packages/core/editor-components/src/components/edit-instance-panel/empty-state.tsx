import * as React from 'react';
import { ComponentPropListIcon, PencilIcon } from '@elementor/icons';
import { Button, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const EmptyState = ( { onEditComponent }: { onEditComponent: () => void } ) => {
	return (
		<Stack
			alignItems="center"
			justifyContent="start"
			height="100%"
			color="text.secondary"
			sx={ { p: 2.5, pt: 8, pb: 5.5, mt: 1 } }
			gap={ 1.5 }
		>
			<ComponentPropListIcon fontSize="large" />

			<Typography align="center" variant="subtitle2">
				{ __( 'No properties yet', 'elementor' ) }
			</Typography>

			<Typography align="center" variant="caption" maxWidth="170px">
				{ __(
					'Edit the component to add properties, manage them or update the design across all instances.',
					'elementor'
				) }
			</Typography>

			<Button variant="outlined" color="secondary" size="small" sx={ { mt: 1 } } onClick={ onEditComponent }>
				<PencilIcon fontSize="small" />
				{ __( 'Edit component', 'elementor' ) }
			</Button>
		</Stack>
	);
};
