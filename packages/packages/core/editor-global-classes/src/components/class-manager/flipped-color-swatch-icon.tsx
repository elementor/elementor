import * as React from 'react';
import { ColorSwatchIcon } from '@elementor/icons';
import { type SvgIconProps } from '@elementor/ui';

export const FlippedColorSwatchIcon = ( { sx, ...props }: SvgIconProps ) => (
	<ColorSwatchIcon sx={ { transform: 'rotate(90deg)', ...sx } } { ...props } />
);
