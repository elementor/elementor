import * as React from 'react';
import { type DropShadowFilterPropValue, type FilterItemPropValue } from '@elementor/editor-props';
import { styled, UnstableColorIndicator } from '@elementor/ui';

export const FilterIcon = ( { value }: { value: FilterItemPropValue } ) => {
	if ( value.value.func.value !== 'drop-shadow' ) {
		return null;
	}

	return (
		<StyledUnstableColorIndicator
			size="inherit"
			component="span"
			value={ ( value.value.args as DropShadowFilterPropValue ).value?.color.value }
		/>
	);
};

const StyledUnstableColorIndicator = styled( UnstableColorIndicator )( ( { theme } ) => ( {
	borderRadius: `${ theme.shape.borderRadius / 2 }px`,
} ) );
