import * as React from 'react';
import { BrushBigIcon } from '@elementor/icons';
import { Box, IconButton, type SxProps, type Theme, Tooltip } from '@elementor/ui';

type Props = {
	ariaLabel: string;
	onClear: () => void;
	sx?: SxProps< Theme >;
	tooltipText: string;
};

export default function ContentPanelClearFiltersButton( { ariaLabel, onClear, sx, tooltipText }: Props ) {
	return (
		<Tooltip disableInteractive placement="top" title={ tooltipText }>
			<Box>
				<IconButton aria-label={ ariaLabel } onClick={ onClear } size="tiny" sx={ sx }>
					<BrushBigIcon fontSize="tiny" />
				</IconButton>
			</Box>
		</Tooltip>
	);
}