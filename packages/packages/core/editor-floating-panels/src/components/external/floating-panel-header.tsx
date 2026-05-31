import * as React from 'react';
import { XIcon } from '@elementor/icons';
import { Box, IconButton, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

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
				alignItems: 'stretch',
				borderBottom: 1,
				borderColor: 'var(--e-a-border-color)',
			} }
		>
			<DragHandle panelId={ panelId }>
				<Box sx={ { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, height: '100%' } }>
					{ Icon ? <Icon /> : null }
					<Typography component="h2" sx={ { textAlign: 'center', fontSize: '13px', fontWeight: 400 } }>
						{ title }
					</Typography>
				</Box>
			</DragHandle>
			<IconButton
				size="small"
				color="inherit"
				aria-label={ __( 'Close panel', 'elementor' ) }
				onClick={ close }
				sx={ { borderRadius: 0, p: 1 } }
			>
				<XIcon fontSize="small" />
			</IconButton>
		</Box>
	);
}
