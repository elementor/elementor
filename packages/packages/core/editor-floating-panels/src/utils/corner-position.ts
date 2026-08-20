import type { LogicalPosition, LogicalSize } from '../types';

export type PanelCorner =
	| 'block-start-inline-start'
	| 'block-start-inline-end'
	| 'block-end-inline-start'
	| 'block-end-inline-end';

export const DEFAULT_INSET_BLOCK_PX = 80;
export const DEFAULT_INSET_INLINE_PX = 24;

type InsetKey = keyof LogicalPosition;

const ACTIVE_INSETS: Record< PanelCorner, [ InsetKey, InsetKey ] > = {
	'block-start-inline-start': [ 'insetInlineStart', 'insetBlockStart' ],
	'block-start-inline-end': [ 'insetInlineEnd', 'insetBlockStart' ],
	'block-end-inline-start': [ 'insetInlineStart', 'insetBlockEnd' ],
	'block-end-inline-end': [ 'insetInlineEnd', 'insetBlockEnd' ],
};

const CORNER_DEFAULTS: Record< PanelCorner, Partial< LogicalPosition > > = {
	'block-start-inline-start': { insetInlineStart: DEFAULT_INSET_INLINE_PX, insetBlockStart: DEFAULT_INSET_BLOCK_PX },
	'block-start-inline-end': { insetInlineEnd: DEFAULT_INSET_INLINE_PX, insetBlockStart: DEFAULT_INSET_BLOCK_PX },
	'block-end-inline-start': { insetInlineStart: DEFAULT_INSET_INLINE_PX, insetBlockEnd: DEFAULT_INSET_BLOCK_PX },
	'block-end-inline-end': { insetInlineEnd: DEFAULT_INSET_INLINE_PX, insetBlockEnd: DEFAULT_INSET_BLOCK_PX },
};

const EMPTY_POSITION: LogicalPosition = {
	insetBlockStart: 0,
	insetBlockEnd: 0,
	insetInlineStart: 0,
	insetInlineEnd: 0,
};

export function getActiveInsetKeys( corner: PanelCorner ): [ InsetKey, InsetKey ] {
	return ACTIVE_INSETS[ corner ];
}

export function usesInlineStart( corner: PanelCorner ): boolean {
	return corner.endsWith( 'inline-start' );
}

export function usesBlockStart( corner: PanelCorner ): boolean {
	return corner.startsWith( 'block-start' );
}

export function buildInitialPosition( corner: PanelCorner, overrides?: Partial< LogicalPosition > ): LogicalPosition {
	const [ inlineKey, blockKey ] = getActiveInsetKeys( corner );
	const defaults = CORNER_DEFAULTS[ corner ];

	return {
		...EMPTY_POSITION,
		[ inlineKey ]: overrides?.[ inlineKey ] ?? defaults[ inlineKey ] ?? 0,
		[ blockKey ]: overrides?.[ blockKey ] ?? defaults[ blockKey ] ?? 0,
	};
}

export function positionToCssInsets(
	corner: PanelCorner,
	position: LogicalPosition
): Partial< Record< InsetKey, string > > {
	const [ inlineKey, blockKey ] = getActiveInsetKeys( corner );

	return {
		[ inlineKey ]: `${ position[ inlineKey ] }px`,
		[ blockKey ]: `${ position[ blockKey ] }px`,
	};
}

export function toStartAnchoredPosition(
	corner: PanelCorner,
	position: LogicalPosition,
	size: LogicalSize,
	viewport: { width: number; height: number }
): Pick< LogicalPosition, 'insetInlineStart' | 'insetBlockStart' > {
	return {
		insetInlineStart: usesInlineStart( corner )
			? position.insetInlineStart
			: viewport.width - position.insetInlineEnd - size.inlineSize,
		insetBlockStart: usesBlockStart( corner )
			? position.insetBlockStart
			: viewport.height - position.insetBlockEnd - size.blockSize,
	};
}

export function fromStartAnchoredPosition(
	corner: PanelCorner,
	startAnchored: Pick< LogicalPosition, 'insetInlineStart' | 'insetBlockStart' >,
	size: LogicalSize,
	viewport: { width: number; height: number }
): LogicalPosition {
	if ( usesInlineStart( corner ) && usesBlockStart( corner ) ) {
		return {
			...EMPTY_POSITION,
			insetInlineStart: startAnchored.insetInlineStart,
			insetBlockStart: startAnchored.insetBlockStart,
		};
	}

	const position = { ...EMPTY_POSITION };

	if ( usesInlineStart( corner ) ) {
		position.insetInlineStart = startAnchored.insetInlineStart;
		position.insetBlockEnd = viewport.height - startAnchored.insetBlockStart - size.blockSize;
	} else if ( usesBlockStart( corner ) ) {
		position.insetInlineEnd = viewport.width - startAnchored.insetInlineStart - size.inlineSize;
		position.insetBlockStart = startAnchored.insetBlockStart;
	} else {
		position.insetInlineEnd = viewport.width - startAnchored.insetInlineStart - size.inlineSize;
		position.insetBlockEnd = viewport.height - startAnchored.insetBlockStart - size.blockSize;
	}

	return position;
}

export function activePositionChanged( corner: PanelCorner, before: LogicalPosition, after: LogicalPosition ): boolean {
	const [ inlineKey, blockKey ] = getActiveInsetKeys( corner );

	return before[ inlineKey ] !== after[ inlineKey ] || before[ blockKey ] !== after[ blockKey ];
}

export type DragBounds = {
	minInlineStart: number;
	maxInlineStart: number;
	minInlineEnd: number;
	maxInlineEnd: number;
	minBlockStart: number;
	maxBlockStart: number;
	minBlockEnd: number;
	maxBlockEnd: number;
};

export function getDragBounds(
	size: LogicalSize,
	viewport: { width: number; height: number },
	sidePanelInlineSize: number,
	appBarHeight: number
): DragBounds {
	return {
		minInlineStart: sidePanelInlineSize,
		maxInlineStart: viewport.width - size.inlineSize,
		minInlineEnd: 0,
		maxInlineEnd: viewport.width - sidePanelInlineSize - size.inlineSize,
		minBlockStart: appBarHeight,
		maxBlockStart: viewport.height - size.blockSize,
		minBlockEnd: 0,
		maxBlockEnd: viewport.height - appBarHeight - size.blockSize,
	};
}
