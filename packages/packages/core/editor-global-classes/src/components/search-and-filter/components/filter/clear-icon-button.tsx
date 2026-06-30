import * as React from 'react';
import { BrushBigIcon } from '@elementor/icons';
import { Box, IconButton, styled, type SxProps, type Theme, Tooltip } from '@elementor/ui';

import { trackGlobalClasses } from '../../../../utils/tracking';
import { useSearchAndFilters } from '../../context';

type ClearIconButtonProps = { tooltipText: React.ReactNode; sx?: SxProps< Theme >; trigger: 'menu' | 'header' };

export const ClearIconButton = ( { tooltipText, sx, trigger }: ClearIconButtonProps ) => {
	const {
		filters: { onClearFilter },
	} = useSearchAndFilters();

	const handleClearFilters = () => {
		onClearFilter( trigger );
		trackGlobalClasses( {
			event: 'classManagerFilterCleared',
			trigger,
		} );
	};

	return (
		<Tooltip title={ tooltipText } placement="top" disableInteractive>
			<Box>
				<CustomIconButton aria-label={ tooltipText } size="tiny" onClick={ handleClearFilters } sx={ sx }>
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
