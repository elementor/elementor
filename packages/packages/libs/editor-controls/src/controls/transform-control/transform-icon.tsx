import * as React from 'react';
import { type TransformItemPropValue } from '@elementor/editor-props';
import { ArrowsMaximizeIcon, ExpandIcon, RotateClockwise2Icon } from '@elementor/icons';

import { TransformFunctionKeys } from './types';

export const TransformIcon = ( { value }: { value: TransformItemPropValue } ) => {
	switch ( value.$$type ) {
		case TransformFunctionKeys.move:
			return <ArrowsMaximizeIcon fontSize="tiny" />;
		case TransformFunctionKeys.scale:
			return <ExpandIcon fontSize="tiny" />;
		case TransformFunctionKeys.rotate:
			return <RotateClockwise2Icon fontSize="tiny" />;
		default:
			return null;
	}
};
