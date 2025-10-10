import * as React from 'react';
import { DetachIcon } from '@elementor/icons';
import { Box, IconButton, Stack, Tooltip, Typography, UnstableTag as Tag, type UnstableTagProps } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const SIZE = 'tiny';
const UNLINK_LABEL = __( 'Unlink variable', 'elementor' );

interface VariableTagProps extends UnstableTagProps {
	onUnlink?: () => void;
}

export const AssignedTag = ( { startIcon, label, onUnlink, ...props }: VariableTagProps ) => {
	const actions = [];

	if ( onUnlink ) {
		actions.push(
			<Tooltip key="unlink" title={ UNLINK_LABEL } placement="bottom">
				<IconButton size={ SIZE } onClick={ onUnlink } aria-label={ UNLINK_LABEL }>
					<DetachIcon fontSize={ SIZE } />
				</IconButton>
			</Tooltip>
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
