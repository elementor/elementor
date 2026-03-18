import { type SizePropValue } from '@elementor/editor-props';

export const hasSizeValue = ( size: SizePropValue[ 'value' ][ 'size' ] ): boolean => {
	return Boolean( size ) || size === 0;
};
