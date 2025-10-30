import * as React from 'react';
import type { FilterItemPropValue } from '@elementor/editor-props';

import { DropShadowItemLabel } from './drop-shadow/drop-shadow-item-label';
import { SingleSizeItemLabel } from './single-size/single-size-item-label';

export const FilterLabel = ( { value }: { value: FilterItemPropValue } ) => {
	if ( value.value.func.value === 'drop-shadow' ) {
		return <DropShadowItemLabel value={ value } />;
	}

	return <SingleSizeItemLabel value={ value } />;
};
