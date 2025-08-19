import * as React from 'react';
import { Tooltip } from '@elementor/ui';

export const ConditionalTooltip = ( {
	showTooltip,
	children,
	label,
}: React.PropsWithChildren< { showTooltip: boolean; label: string } > ) => {
	return showTooltip && label ? (
		<Tooltip title={ label } disableFocusListener={ true } placement="top">
			{ children }
		</Tooltip>
	) : (
		children
	);
};
