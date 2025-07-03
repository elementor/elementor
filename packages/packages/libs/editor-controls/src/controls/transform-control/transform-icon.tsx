import * as React from 'react';
import { type TransformItemPropValue } from '@elementor/editor-props';
import { ArrowsMaximizeIcon } from '@elementor/icons';

export const TransformIcon = ( { value }: { value: TransformItemPropValue } ) => {
	switch ( value.$$type ) {
		case 'transform-move':
			return <ArrowsMaximizeIcon fontSize="tiny" />;
		default:
			return null;
	}
};
