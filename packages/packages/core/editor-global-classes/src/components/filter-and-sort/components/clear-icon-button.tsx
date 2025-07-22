import * as React from 'react';
import { BrushBigIcon } from '@elementor/icons';
import { IconButton, type SxProps, type Theme, Tooltip } from '@elementor/ui';

import { useFilterAndSortContext } from '../context';

type ClearIconButtonProps = { tooltipText: React.ReactNode; sxStyle?: SxProps< Theme > };

export const ClearIconButton = ( { tooltipText, sxStyle }: ClearIconButtonProps ) => {
	const { onReset } = useFilterAndSortContext();
	return (
		<Tooltip title={ tooltipText } placement="top">
			<IconButton key={ 'clear-filters' } size="tiny" onClick={ onReset } sx={ sxStyle }>
				<BrushBigIcon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
};
