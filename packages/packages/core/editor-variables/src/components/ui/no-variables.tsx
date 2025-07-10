import * as React from 'react';
import { Button, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { usePermissions } from '../../hooks/use-permissions';

type Props = {
	icon?: React.ReactNode;
	title?: string;
	onAdd?: () => void;
};

export const NoVariables = ( { icon, title, onAdd }: Props ) => {
	const userPermissions = usePermissions();

	return (
		<Stack
			gap={ 1 }
			alignItems="center"
			justifyContent="center"
			height="100%"
			color="text.secondary"
			sx={ { p: 2.5, pb: 5.5 } }
		>
			{ icon }

			{ userPermissions.canAdd() ? (
				<CreateYourVariable title={ title } onAdd={ onAdd } />
			) : (
				<NoVariablesFallback />
			) }
		</Stack>
	);
};

function CreateYourVariable( { title, onAdd }: Omit< Props, 'icon' > ) {
	return (
		<>
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
		</>
	);
}

function NoVariablesFallback() {
	return (
		<>
			<Typography align="center" variant="subtitle2">
				{ __( 'There are no variables', 'elementor' ) }
			</Typography>

			<Typography align="center" variant="caption" maxWidth="180px">
				{ __( 'With your current permissions, you can only connect and detach variables.', 'elementor' ) }
			</Typography>
		</>
	);
}
