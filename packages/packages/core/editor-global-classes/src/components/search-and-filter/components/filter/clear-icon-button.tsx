import * as React from 'react';
import { BrushBigIcon } from '@elementor/icons';
import { Box, IconButton, styled, type SxProps, type Theme, Tooltip } from '@elementor/ui';

import { useSearchAndFilters } from '../../context';

type ClearIconButtonProps = { tooltipText: React.ReactNode; sx?: SxProps< Theme > };

export const ClearIconButton = ( { tooltipText, sx }: ClearIconButtonProps ) => {
	const {
		filters: { onClearFilter },
	} = useSearchAndFilters();

	return (
		<Tooltip title={ tooltipText } placement="top" disableInteractive>
			<Box>
				<CustomIconButton aria-label={ tooltipText } size="tiny" onClick={ onClearFilter } sx={ sx }>
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
