import * as React from 'react';
import { type PointerEventHandler } from 'react';
import { Box } from '@elementor/ui';

import { isRtl } from '../../utils/direction';
import { type ResizeCorner } from '../../utils/resize-math';

const HANDLE_SIZE_PX = 8;

type CornerPosition = { insetBlockStart?: 0; insetBlockEnd?: 0; insetInlineStart?: 0; insetInlineEnd?: 0 };

const CORNER_POSITION: Record< ResizeCorner, CornerPosition > = {
	'block-start-inline-start': { insetBlockStart: 0, insetInlineStart: 0 },
	'block-start-inline-end': { insetBlockStart: 0, insetInlineEnd: 0 },
	'block-end-inline-start': { insetBlockEnd: 0, insetInlineStart: 0 },
	'block-end-inline-end': { insetBlockEnd: 0, insetInlineEnd: 0 },
};

const LTR_CURSORS: Record< ResizeCorner, string > = {
	'block-start-inline-start': 'nwse-resize',
	'block-start-inline-end': 'nesw-resize',
	'block-end-inline-start': 'nesw-resize',
	'block-end-inline-end': 'nwse-resize',
};

const RTL_CURSORS: Record< ResizeCorner, string > = {
	'block-start-inline-start': 'nesw-resize',
	'block-start-inline-end': 'nwse-resize',
	'block-end-inline-start': 'nwse-resize',
	'block-end-inline-end': 'nesw-resize',
};

type Props = {
	corner: ResizeCorner;
	onPointerDown: PointerEventHandler< HTMLElement >;
	onPointerMove: PointerEventHandler< HTMLElement >;
	onPointerUp: PointerEventHandler< HTMLElement >;
	onPointerCancel: PointerEventHandler< HTMLElement >;
};

export default function CornerResizeHandle( {
	corner,
	onPointerDown,
	onPointerMove,
	onPointerUp,
	onPointerCancel,
}: Props ) {
	const cursor = isRtl() ? RTL_CURSORS[ corner ] : LTR_CURSORS[ corner ];

	return (
		<Box
			data-resize-corner={ corner }
			aria-hidden="true"
			onPointerDown={ onPointerDown }
			onPointerMove={ onPointerMove }
			onPointerUp={ onPointerUp }
			onPointerCancel={ onPointerCancel }
			sx={ {
				position: 'absolute',
				touchAction: 'none',
				zIndex: 2,
				inlineSize: `${ HANDLE_SIZE_PX }px`,
				blockSize: `${ HANDLE_SIZE_PX }px`,
				cursor,
				...CORNER_POSITION[ corner ],
			} }
		/>
	);
}
