import * as React from 'react';
import { Box, type BoxProps } from '@elementor/ui';

import ResizeHandle from '../internal/resize-handle';

type Props = BoxProps & {
	panelId?: string;
};

export default function FloatingPanelFooter( { panelId, children, sx, ...props }: Props ) {
	return (
		<Box
			{ ...props }
			sx={ {
				px: 2,
				py: 1.5,
				borderTop: 1,
				borderColor: 'var(--e-a-border-color)',
				display: 'flex',
				alignItems: 'center',
				gap: 1,
				position: panelId ? 'relative' : undefined,
				...( sx ?? {} ),
			} }
		>
			{ children }
			{ panelId ? (
				<>
					<ResizeHandle panelId={ panelId } edge="inline-start" />
					<ResizeHandle panelId={ panelId } edge="inline-end" />
					<ResizeHandle panelId={ panelId } edge="block-end" />
				</>
			) : null }
		</Box>
	);
}
