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
	const canAdd = usePermissions().canAdd();

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

			{ canAdd ? (
				<>
					<NoVariablesContent
						title={ title || __( 'Create your first variable', 'elementor' ) }
						message={ __(
							'Variables are saved attributes that you can apply anywhere on your site.',
							'elementor'
						) }
					/>
					{ onAdd && (
						<Button variant="outlined" color="secondary" size="small" onClick={ onAdd }>
							{ __( 'Create a variable', 'elementor' ) }
						</Button>
					) }
				</>
			) : (
				<NoVariablesContent
					title={ __( 'There are no variables', 'elementor' ) }
					message={ __( 'With your current role, you can only connect and detach variables.', 'elementor' ) }
				/>
			) }
		</Stack>
	);
};

type NoVariablesContentProps = {
	title: string;
	message: string;
};

function NoVariablesContent( { title, message }: NoVariablesContentProps ) {
	return (
		<>
			<Typography align="center" variant="subtitle2">
				{ title }
			</Typography>

			<Typography align="center" variant="caption" maxWidth="180px">
				{ message }
			</Typography>
		</>
	);
}
