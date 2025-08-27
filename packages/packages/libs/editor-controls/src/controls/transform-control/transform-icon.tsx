import * as React from 'react';
import { type TransformFunctionsItemPropValue } from '@elementor/editor-props';
import { ArrowsMaximizeIcon, ExpandIcon, RotateClockwise2Icon, SkewXIcon } from '@elementor/icons';

import { TransformFunctionKeys } from './initial-values';

export const TransformIcon = ( { value }: { value: TransformFunctionsItemPropValue } ) => {
	switch ( value.$$type ) {
		case TransformFunctionKeys.move:
			return <ArrowsMaximizeIcon fontSize="tiny" />;
		case TransformFunctionKeys.scale:
			return <ExpandIcon fontSize="tiny" />;
		case TransformFunctionKeys.rotate:
			return <RotateClockwise2Icon fontSize="tiny" />;
		case TransformFunctionKeys.skew:
			return <SkewXIcon fontSize="tiny" />;
		default:
			return null;
	}
};
