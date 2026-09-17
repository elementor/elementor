import * as React from 'react';
import { type ReactNode } from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { __useSelector as useSelector } from '@elementor/store';
import { Box, Fade, Paper } from '@elementor/ui';

import { usePanelResizeInteraction } from '../../hooks/use-floating-panel-resize';
import { type GlobalState, selectIsResizable } from '../../store/selectors';
import { type LogicalPosition, type LogicalSize } from '../../types';
import { type PanelCorner, positionToCssInsets } from '../../utils/corner-position';
import { type ResizeCorner, type ResizeEdge } from '../../utils/resize-math';
import CornerResizeHandle from './corner-resize-handle';
import ResizeHandle from './resize-handle';

const FADE_ENTER_MS = 225;
const FADE_EXIT_MS = 195;

const RESIZE_EDGES: ResizeEdge[] = [ 'inline-start', 'inline-end', 'block-start', 'block-end' ];

const RESIZE_CORNERS: ResizeCorner[] = [
	'block-start-inline-start',
	'block-start-inline-end',
	'block-end-inline-start',
	'block-end-inline-end',
];

type Props = {
	panelId: string;
	corner: PanelCorner;
	position: LogicalPosition;
	size: LogicalSize;
	title?: string;
	zIndex: number;
	visible: boolean;
	onFocus: () => void;
	children: ReactNode;
};

function PanelResizeHandles( { panelId }: { panelId: string } ) {
	const { getResizeHandleProps } = usePanelResizeInteraction( panelId );

	return (
		<>
			{ RESIZE_EDGES.map( ( edge ) => (
				<ResizeHandle key={ edge } edge={ edge } { ...getResizeHandleProps( edge ) } />
			) ) }
			{ RESIZE_CORNERS.map( ( corner ) => (
				<CornerResizeHandle key={ corner } corner={ corner } { ...getResizeHandleProps( corner ) } />
			) ) }
		</>
	);
}

export default function PanelWindow( {
	panelId,
	corner,
	position,
	size,
	title,
	zIndex,
	visible,
	onFocus,
	children,
}: Props ) {
	const isResizable = useSelector( ( state: GlobalState ) => selectIsResizable( state, panelId ) );

	return (
		<Fade in={ visible } timeout={ { enter: FADE_ENTER_MS, exit: FADE_EXIT_MS } }>
			<Paper
				component="aside"
				data-floating-panel={ panelId }
				elevation={ 0 }
				aria-label={ title || panelId }
				aria-hidden={ ! visible }
				inert={ ! visible ? '' : undefined }
				onMouseDown={ onFocus }
				onFocusCapture={ onFocus }
				sx={ {
					position: 'fixed',
					...positionToCssInsets( corner, position ),
					inlineSize: `${ size.inlineSize }px`,
					blockSize: `${ size.blockSize }px`,
					zIndex,
					display: 'flex',
					flexDirection: 'column',
					pointerEvents: visible ? 'auto' : 'none',
					bgcolor: 'var(--e-a-bg-default)',
					color: 'var(--e-a-color-txt)',
					border: 'var(--e-a-border)',
					boxShadow: `0 2px 20px 0 rgba(0, 0, 0, 0.1)`,
				} }
			>
				<ThemeProvider>
					<Box sx={ { display: 'flex', flexDirection: 'column', height: '100%' } }>{ children }</Box>
				</ThemeProvider>
				{ isResizable && <PanelResizeHandles panelId={ panelId } /> }
			</Paper>
		</Fade>
	);
}
