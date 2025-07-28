import * as React from 'react';
import { BrushBigIcon } from '@elementor/icons';
import { Box, IconButton, styled, type SxProps, type Theme, Tooltip } from '@elementor/ui';

import { useSearchAndFilters } from '../../context';

type ClearIconButtonProps = { tooltipText: React.ReactNode; sx?: SxProps< Theme >; disabled?: boolean };

export const ClearIconButton = ( { tooltipText, sx, disabled }: ClearIconButtonProps ) => {
	const {
		filters: { onClearFilter, filters },
	} = useSearchAndFilters();
	return (
		<Tooltip title={ tooltipText } placement="top" disableInteractive>
			<Box>
				<CustomIconButton
					aria-label={ tooltipText }
					size="tiny"
					onClick={ onClearFilter }
					sx={ sx }
					disabled={ disabled || ! Object.values( filters ).some( ( value ) => value ) }
				>
					<BrushBigIcon fontSize="tiny" />
				</CustomIconButton>
			</Box>
		</Tooltip>
	);
};
const CustomIconButton = styled( IconButton )( ( { theme } ) => ( {
	'&.Mui-disabled': {
		pointerEvents: 'auto',
		'&:hover': {
			color: theme.palette.action.disabled,
		},
	},
} ) );
