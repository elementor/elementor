import * as React from 'react';
import { Button, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

type Props = {
	icon?: React.ReactNode;
	title?: string;
	onAdd?: () => void;
};

export const NoVariables = ( { icon, title, onAdd }: Props ) => (
	<Stack
		gap={ 1 }
		alignItems="center"
		justifyContent="center"
		height="100%"
		color="text.secondary"
		sx={ { p: 2.5, pb: 5.5 } }
	>
		{ icon }

		<Typography align="center" variant="subtitle2">
			{ title }
		</Typography>

		<Typography align="center" variant="caption" maxWidth="180px">
			{ __( 'Variables are saved attributes that you can apply anywhere on your site.', 'elementor' ) }
		</Typography>

		{ onAdd && (
			<Button variant="outlined" color="secondary" size="small" onClick={ onAdd }>
				{ __( 'Create a variable', 'elementor' ) }
			</Button>
		) }
	</Stack>
);
