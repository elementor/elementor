import * as React from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { __useSelector as useSelector } from '@elementor/store';
import { Box, Fade, Paper } from '@elementor/ui';

import { useFloatingPanelStatus } from '../../hooks/use-floating-panel-status';
import { type GlobalState, selectPanelTitle } from '../../store/selectors';
import CornerResizeHandle from './corner-resize-handle';
import ResizeHandle from './resize-handle';

const FADE_ENTER_MS = 225;
const FADE_EXIT_MS = 195;

type Props = {
	panelId: string;
	zIndex: number;
	visible: boolean;
	onFocus: () => void;
	children: React.ReactNode;
};

export default function PanelWindow( { panelId, zIndex, visible, onFocus, children }: Props ) {
	const { position, size } = useFloatingPanelStatus( panelId );
	const title = useSelector( ( state: GlobalState ) => selectPanelTitle( state, panelId ) );

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
		<Fade in={ visible } timeout={ { enter: FADE_ENTER_MS, exit: FADE_EXIT_MS } }>
			<Paper
				component="aside"
				data-floating-panel={ panelId }
				elevation={ 0 }
				aria-label={ title || panelId }
				aria-hidden={ ! visible }
				onMouseDown={ onFocus }
				sx={ {
					...floatingSx,
					display: 'flex',
					flexDirection: 'column',
					bgcolor: 'var(--e-a-bg-default)',
					color: 'var(--e-a-color-txt)',
					border: 'var(--e-a-border)',
					boxShadow: `0 2px 20px 0 rgba(0, 0, 0, 0.1)`,
				} }
			>
				<ThemeProvider>
					<Box sx={ { display: 'flex', flexDirection: 'column', height: '100%' } }>{ children }</Box>
				</ThemeProvider>
				<ResizeHandle panelId={ panelId } edge="inline-start" />
				<ResizeHandle panelId={ panelId } edge="inline-end" />
				<ResizeHandle panelId={ panelId } edge="block-start" />
				<ResizeHandle panelId={ panelId } edge="block-end" />
				<CornerResizeHandle panelId={ panelId } corner="block-start-inline-start" />
				<CornerResizeHandle panelId={ panelId } corner="block-start-inline-end" />
				<CornerResizeHandle panelId={ panelId } corner="block-end-inline-start" />
				<CornerResizeHandle panelId={ panelId } corner="block-end-inline-end" />
			</Paper>
		</Fade>
	);
}
