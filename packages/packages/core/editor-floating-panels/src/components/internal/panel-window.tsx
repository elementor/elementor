import * as React from 'react';
import { Box, Paper } from '@elementor/ui';

import { useFloatingPanelStatus } from '../../hooks/use-floating-panel-status';

type Props = {
	panelId: string;
	zIndex: number;
	onFocus: () => void;
	children: React.ReactNode;
};

export default function PanelWindow( { panelId, zIndex, onFocus, children }: Props ) {
	const { position, size } = useFloatingPanelStatus( panelId );

	if ( ! position || ! size ) {
		return null;
	}

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
			elevation={ 8 }
			role="dialog"
			aria-label={ panelId }
			onMouseDown={ onFocus }
			sx={ {
				...floatingSx,
				display: 'flex',
				flexDirection: 'column',
				bgcolor: 'background.default',
			} }
		>
			<Box sx={ { display: 'flex', flexDirection: 'column', height: '100%' } }>{ children }</Box>
		</Paper>
	);
}
