import * as React from 'react';
import { Box, Paper } from '@elementor/ui';

import { useFloatingPanelStatus } from '../../hooks/use-floating-panel-status';

type Props = {
	panelId: string;
	title: string;
	zIndex: number;
	onFocus: () => void;
	children: React.ReactNode;
};

export default function PanelWindow( { panelId, title, zIndex, onFocus, children }: Props ) {
	const { mode, position, size } = useFloatingPanelStatus( panelId );

	if ( ! position || ! size ) {
		return null;
	}

	const dockedSx = {
		position: 'fixed' as const,
		insetInlineEnd: 0,
		insetBlockStart: 'var(--e-editor-app-bar-height, 60px)',
		insetBlockEnd: 0,
		inlineSize: `${ size.inlineSize }px`,
		zIndex,
	};

	const floatingSx = {
		position: 'fixed' as const,
		insetInlineStart: `${ position.insetInlineStart }px`,
		insetBlockStart: `${ position.insetBlockStart }px`,
		inlineSize: `${ size.inlineSize }px`,
		blockSize: `${ size.blockSize }px`,
		zIndex,
	};

	return (
		<Paper
			data-floating-panel={ panelId }
			elevation={ mode === 'floating' ? 8 : 0 }
			role="dialog"
			aria-label={ title }
			onMouseDown={ onFocus }
			sx={ {
				...( mode === 'docked' ? dockedSx : floatingSx ),
				display: 'flex',
				flexDirection: 'column',
				bgcolor: 'background.default',
			} }
		>
			<Box sx={ { display: 'flex', flexDirection: 'column', height: '100%' } }>{ children }</Box>
		</Paper>
	);
}
