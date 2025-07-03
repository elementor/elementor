import * as React from 'react';
import { DetachIcon } from '@elementor/icons';
import { Box, IconButton, Stack, Tooltip, Typography, UnstableTag as Tag, type UnstableTagProps } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const SIZE = 'tiny';

interface VariableTagProps extends UnstableTagProps {
	onUnlink?: () => void;
}

export const AssignedTag = ( { startIcon, label, onUnlink, ...props }: VariableTagProps ) => {
	const actions = [];

	if ( onUnlink ) {
		actions.push(
			<IconButton key="unlink" size={ SIZE } onClick={ onUnlink } aria-label={ __( 'Unlink', 'elementor' ) }>
				<DetachIcon fontSize={ SIZE } />
			</IconButton>
		);
	}

	return (
		<Tooltip title={ label } placement="top">
			<Tag
				fullWidth
				showActionsOnHover
				startIcon={
					<Stack gap={ 0.5 } direction="row" alignItems="center">
						{ startIcon }
					</Stack>
				}
				label={
					<Box sx={ { display: 'inline-grid', minWidth: 0 } }>
						<Typography sx={ { lineHeight: 1.34 } } variant="caption" noWrap>
							{ label }
						</Typography>
					</Box>
				}
				actions={ actions }
				{ ...props }
			/>
		</Tooltip>
	);
};
