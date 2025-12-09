import * as React from 'react';
import { UpgradeButton } from '@elementor/editor-ui';
import { Button, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useVariableType } from '../../context/variable-type-context';
import { usePermissions } from '../../hooks/use-permissions';

type Props = {
	icon?: React.ReactNode;
	title: string;
	message: string;
	onAdd?: () => void;
	upgradeUrl?: string;
};

export const EmptyState = ( { icon, title, message, upgradeUrl, onAdd }: Props ) => {
	const canAdd = usePermissions().canAdd();
	const { isUpgradeRequired } = useVariableType();

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

			{ canAdd || isUpgradeRequired ? (
				<>
					<Content title={ title } message={ message } />
					{ onAdd && (
						<Button variant="outlined" color="secondary" size="small" onClick={ onAdd }>
							{ __( 'Create a variable', 'elementor' ) }
						</Button>
					) }
					{ isUpgradeRequired && <UpgradeButton size="small" href={ upgradeUrl ?? '' } /> }
				</>
			) : (
				<Content
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

function Content( { title, message }: NoVariablesContentProps ) {
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
