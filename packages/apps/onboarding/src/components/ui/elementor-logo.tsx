import * as React from 'react';
import { Stack, type StackProps, useTheme } from '@elementor/ui';

import { ElementorIcon } from './elementor-icon';
import { ElementorWordmark } from './elementor-wordmark';

interface ElementorLogoProps extends Omit< StackProps, 'direction' > {
	height?: number;
}

export function ElementorLogo( { height = 20, sx, ...props }: ElementorLogoProps ) {
	const theme = useTheme();

	// Icon is square
	const iconSize = height;

	// Wordmark viewBox is 90x15, aspect ratio 6
	const wordmarkHeight = height * 0.8;
	const wordmarkWidth = wordmarkHeight * 6;

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
