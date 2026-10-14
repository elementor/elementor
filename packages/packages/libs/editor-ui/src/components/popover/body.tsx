import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { Box } from '@elementor/ui';

const SECTION_PADDING_INLINE = 32;
const DEFAULT_POPOVER_HEIGHT = 348;
const FALLBACK_POPOVER_WIDTH = 220;

type PopoverBodyProps = PropsWithChildren< {
	height?: number | 'auto';
	width?: number;
	id?: string;
	fillWidth?: boolean;
} >;

export const PopoverBody = ( {
	children,
	height = DEFAULT_POPOVER_HEIGHT,
	width,
	id,
	fillWidth = false,
}: PopoverBodyProps ) => {
	const resolvedWidth = resolvePopoverWidth( width, fillWidth );

	return (
		<Box
			display="flex"
			flexDirection="column"
			sx={ {
				height,
				overflow: 'hidden',
				width: `${ resolvedWidth }px`,
				maxWidth: fillWidth ? resolvedWidth : 496,
			} }
			id={ id }
		>
			{ children }
		</Box>
	);
};

function resolvePopoverWidth( width: number | undefined, fillWidth: boolean ): number {
	if ( ! width ) {
		return FALLBACK_POPOVER_WIDTH;
	}

	if ( fillWidth ) {
		return width;
	}

	return width - SECTION_PADDING_INLINE;
}
