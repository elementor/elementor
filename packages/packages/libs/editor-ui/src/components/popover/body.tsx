import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { Box } from '@elementor/ui';

const SECTION_PADDING_INLINE = 32;
const DEFAULT_POPOVER_HEIGHT = 348;
const FALLBACK_POPOVER_WIDTH = 220;

type PopoverBodyProps = PropsWithChildren< {
	height?: number | 'auto';
	width?: number;
} >;

export const PopoverBody = ( { children, height = DEFAULT_POPOVER_HEIGHT, width }: PopoverBodyProps ) => {
	return (
		<Box
			display="flex"
			flexDirection="column"
			sx={ {
				height,
				overflow: 'hidden',
				width: `${ width ? width - SECTION_PADDING_INLINE : FALLBACK_POPOVER_WIDTH }px`,
				maxWidth: 496,
			} }
		>
			{ children }
		</Box>
	);
};
