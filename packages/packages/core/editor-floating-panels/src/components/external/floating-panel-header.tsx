import * as React from 'react';
import { XIcon } from '@elementor/icons';
import { Box, IconButton, Typography } from '@elementor/ui';

import { useFloatingPanelActions } from '../../hooks/use-floating-panel-actions';
import DragHandle from '../internal/drag-handle';

type Props = {
	panelId: string;
	title: string;
	icon?: React.ComponentType;
};

export default function FloatingPanelHeader( { panelId, title, icon: Icon }: Props ) {
	const { close } = useFloatingPanelActions( panelId );

	return (
		<Box
			sx={ {
				display: 'flex',
				alignItems: 'center',
				gap: 1,
				px: 1.5,
				py: 1,
				borderBottom: 1,
				borderColor: 'divider',
			} }
		>
			<DragHandle panelId={ panelId }>
				<Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
					{ Icon ? <Icon /> : null }
					<Typography variant="subtitle2" component="h2">
						{ title }
					</Typography>
				</Box>
			</DragHandle>
			<IconButton size="small" aria-label="Close panel" onClick={ close }>
				<XIcon />
			</IconButton>
		</Box>
	);
}
