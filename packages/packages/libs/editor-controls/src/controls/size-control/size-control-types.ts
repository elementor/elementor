import { type RefObject } from 'react';

import {
	type AngleUnit,
	type ExtendedOption,
	type LengthUnit,
	type TimeUnit,
	type Unit,
} from '../../utils/size-control';

export type SizeVariant = 'length' | 'angle' | 'time';

export type UnitProps< T extends readonly Unit[] > = {
	units?: T;
	defaultUnit?: T[ number ];
};

export type BaseSizeControlProps = {
	variant?: 'length' | 'angle' | 'time';
	placeholder?: string;
	startIcon?: React.ReactNode;
	extendedOptions?: ExtendedOption[];
	disableCustom?: boolean;
	anchorRef?: RefObject< HTMLDivElement | null >;
	min?: number;
	enablePropTypeUnits?: boolean;
	id?: string;
	ariaLabel?: string;
	units?: Unit[];
	defaultUnit?: Unit;
};

export type LengthSizeControlProps = BaseSizeControlProps &
	UnitProps< LengthUnit[] > & {
		variant?: 'length';
	};

export type AngleSizeControlProps = BaseSizeControlProps &
	UnitProps< AngleUnit[] > & {
		variant?: 'angle';
	};

export type TimeSizeControlProps = BaseSizeControlProps &
	UnitProps< TimeUnit[] > & {
		variant?: 'time';
	};

export type SizeControlProps = LengthSizeControlProps | AngleSizeControlProps | TimeSizeControlProps;

export const CUSTOM_SIZE_LABEL = 'fx';
