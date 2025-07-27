import * as React from 'react';
import { BrushBigIcon } from '@elementor/icons';
import { IconButton, type SxProps, type Theme, Tooltip } from '@elementor/ui';

import { useSearchAndFilters } from '../../context';

type ClearIconButtonProps = { tooltipText: React.ReactNode; sx?: SxProps< Theme > };

export const ClearIconButton = ( { tooltipText, sx }: ClearIconButtonProps ) => {
	const {
		filters: { onClearFilter },
	} = useSearchAndFilters();
	return (
		<Tooltip title={ tooltipText } placement="top" disableInteractive>
			<IconButton size="tiny" onClick={ onClearFilter } sx={ sx }>
				<BrushBigIcon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
};
