import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { Box } from '@elementor/ui';

const SECTION_PADDING_INLINE = 32;
const DEFAULT_POPOVER_WIDTH = 220;

type PopoverScrollableContentProps = PropsWithChildren< {
	height?: number | 'auto';
	width?: number;
} >;

const isVersion330Active = isExperimentActive( 'e_v_3_30' );

export const PopoverScrollableContent = React.forwardRef< HTMLDivElement, PopoverScrollableContentProps >(
	( { children, height = 260, width = DEFAULT_POPOVER_WIDTH }, ref ) => {
		return (
			<Box
				ref={ ref }
				sx={ {
					overflowY: 'auto',
					height,
					width: `${ isVersion330Active ? width - SECTION_PADDING_INLINE : DEFAULT_POPOVER_WIDTH }px`,
					maxWidth: 496,
				} }
			>
				{ children }
			</Box>
		);
	}
);
