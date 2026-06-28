import * as React from 'react';
import { Box } from '@elementor/ui';

import { type ResizeEdge } from '../../utils/resize-math';

const HANDLE_THICKNESS_PX = 8;

const EDGE_SX: Record< ResizeEdge, object > = {
	'inline-start': {
		insetBlockStart: 0,
		insetBlockEnd: 0,
		insetInlineStart: 0,
		inlineSize: `${ HANDLE_THICKNESS_PX }px`,
		cursor: 'ew-resize',
	},
	'inline-end': {
		insetBlockStart: 0,
		insetBlockEnd: 0,
		insetInlineEnd: 0,
		inlineSize: `${ HANDLE_THICKNESS_PX }px`,
		cursor: 'ew-resize',
	},
	'block-start': {
		insetInlineStart: 0,
		insetInlineEnd: 0,
		insetBlockStart: 0,
		blockSize: `${ HANDLE_THICKNESS_PX }px`,
		cursor: 'ns-resize',
	},
	'block-end': {
		insetInlineStart: 0,
		insetInlineEnd: 0,
		insetBlockEnd: 0,
		blockSize: `${ HANDLE_THICKNESS_PX }px`,
		cursor: 'ns-resize',
	},
};

type Props = {
	edge: ResizeEdge;
	onPointerDown: React.PointerEventHandler< HTMLElement >;
	onPointerMove: React.PointerEventHandler< HTMLElement >;
	onPointerUp: React.PointerEventHandler< HTMLElement >;
	onPointerCancel: React.PointerEventHandler< HTMLElement >;
};

export default function ResizeHandle( { edge, onPointerDown, onPointerMove, onPointerUp, onPointerCancel }: Props ) {
	return (
		<Box
			data-resize-edge={ edge }
			aria-hidden="true"
			onPointerDown={ onPointerDown }
			onPointerMove={ onPointerMove }
			onPointerUp={ onPointerUp }
			onPointerCancel={ onPointerCancel }
			sx={ { position: 'absolute', touchAction: 'none', zIndex: 1, ...EDGE_SX[ edge ] } }
		/>
	);
}
