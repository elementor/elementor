import * as React from 'react';
import { Stack, type StackProps, useTheme } from '@elementor/ui';

import { ElementorIcon } from './elementor-icon';
import { ElementorWordmark } from './elementor-wordmark';

interface ElementorLogoProps extends Omit< StackProps, 'direction' > {
	/**
	 * Height of the logo. Width scales proportionally (~5.8:1 ratio).
	 * @default 20
	 */
	height?: number;
}

/**
 * Full Elementor logo with icon and wordmark.
 * Uses theme text.primary color by default.
 * @param root0
 * @param root0.height
 * @param root0.sx
 */
export function ElementorLogo( { height = 20, sx, ...props }: ElementorLogoProps ) {
	const theme = useTheme();

	// Icon is square
	const iconSize = height;

	// Wordmark viewBox is 143x23, aspect ratio ~6.2:1
	// Height is slightly less than icon to align visually
	const wordmarkHeight = height * 0.8;
	const wordmarkWidth = wordmarkHeight * ( 143 / 23 );

	return (
		<Stack
			direction="row"
			alignItems="center"
			spacing={ 0.5 }
			sx={ {
				color: theme.palette.text.primary,
				...sx,
			} }
			{ ...props }
		>
			<ElementorIcon sx={ { width: iconSize, height: iconSize } } />
			<ElementorWordmark sx={ { width: wordmarkWidth, height: wordmarkHeight } } />
		</Stack>
	);
}
