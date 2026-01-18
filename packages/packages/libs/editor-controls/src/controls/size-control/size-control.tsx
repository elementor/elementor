import * as React from 'react';

import { AngleSizeControl } from './angle-size-control';
import { LengthSizeControl } from './length-size-control';
import {
	type AngleSizeControlProps,
	type LengthSizeControlProps,
	type BaseSizeControlProps,
	type TimeSizeControlProps,
} from './size-control-types';
import { TimeSizeControl } from './time-size-control';
import { createControl } from '../../create-control';

/**
 * Generic SizeControl component that accepts an optional variant prop and delegates to the appropriate variant-specific control.
 * This is a proxy component for backward compatibility.
 *
 * For better type safety and tree-shaking, consider using the specific variant controls directly:
 * - LengthSizeControl for length measurements (px, em, rem, %, vw, vh, etc.)
 * - AngleSizeControl for angle measurements (deg, rad, grad, turn)
 * - TimeSizeControl for time measurements (ms, s)
 *
 * @param props - Size control props with optional variant (defaults to 'length')
 */
export const SizeControl = createControl( ( props: BaseSizeControlProps ) => {
	const { variant = 'length', ...rest } = props as BaseSizeControlProps;

	switch ( variant ) {
		case 'angle':
			return <AngleSizeControl { ...( rest as Omit< AngleSizeControlProps, 'variant' > ) } />;
		case 'time':
			return <TimeSizeControl { ...( rest as Omit< TimeSizeControlProps, 'variant' > ) } />;
		case 'length':
		default:
			return <LengthSizeControl { ...( rest as Omit< LengthSizeControlProps, 'variant' > ) } />;
	}
});
