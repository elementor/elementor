import * as React from 'react';
import { Button, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { usePermissions } from '../../hooks/use-permissions';

type Props = {
	icon?: React.ReactNode;
	title: string;
	message: string;
	onAdd?: () => void;
	children?: React.ReactNode;
};

export const EmptyState = ( { icon, title, message, onAdd, children }: Props ) => {
	const canAdd = usePermissions().canAdd();
	const displayTitle = canAdd ? title : __( 'There are no variables', 'elementor' );
	const displayMessage = canAdd
		? message
		: __( 'With your current role, you can only connect and detach variables.', 'elementor' );

	return (
		<Content title={ displayTitle } message={ displayMessage } icon={ icon }>
			{ children ||
				( onAdd && (
					<Button variant="outlined" color="secondary" size="small" onClick={ onAdd }>
						{ __( 'Create a variable', 'elementor' ) }
					</Button>
				) ) }
		</Content>
	);
};

type NoVariablesContentProps = {
	title: string;
	message: string;
	icon?: React.ReactNode;
	children?: React.ReactNode;
};

function Content( { title, message, icon, children }: NoVariablesContentProps ) {
	return (
		<Stack
			gap={ 1 }
			alignItems="center"
			justifyContent="flex-start"
			height="100%"
			color="text.secondary"
			sx={ { p: 2.5, pt: 8, pb: 5.5 } }
		>
			{ icon }

			<Typography align="center" variant="subtitle2">
				{ title }
			</Typography>

			<Typography align="center" variant="caption" maxWidth="180px">
				{ message }
			</Typography>

			{ children }
		</Stack>
	);
}
