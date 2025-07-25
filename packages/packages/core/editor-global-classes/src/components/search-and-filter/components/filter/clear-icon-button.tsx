import * as React from 'react';
import { BrushBigIcon } from '@elementor/icons';
import { IconButton, type SxProps, type Theme, Tooltip } from '@elementor/ui';

import { useSearchAndFilters } from '../../context';

type ClearIconButtonProps = { tooltipText: React.ReactNode; sxStyle?: SxProps< Theme > };

export const ClearIconButton = ( { tooltipText, sxStyle }: ClearIconButtonProps ) => {
	const {
		filters: { onClearFilter },
	} = useSearchAndFilters();
	return (
		<Tooltip title={ tooltipText } placement="top" disableInteractive>
			<IconButton size="tiny" onClick={ onClearFilter } sx={ sxStyle }>
				<BrushBigIcon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
};
