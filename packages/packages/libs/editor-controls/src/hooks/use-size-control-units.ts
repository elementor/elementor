import { useMemo } from 'react';
import { type PropType } from '@elementor/editor-props';

import {
	type AngleUnit,
	angleUnits,
	type ExtendedOption,
	type LengthUnit,
	lengthUnits,
	type TimeUnit,
	timeUnits,
	type Unit,
} from '../utils/size-control';

type SizeVariant = 'length' | 'angle' | 'time';

const defaultSelectedUnit: Record< SizeVariant, Unit > = {
	length: 'px',
	angle: 'deg',
	time: 'ms',
} as const;

const defaultUnits: Record< SizeVariant, Unit[] > = {
	length: [ ...lengthUnits ] as LengthUnit[],
	angle: [ ...angleUnits ] as AngleUnit[],
	time: [ ...timeUnits ] as TimeUnit[],
} as const;

export function useSizeControlUnits(
	variant: SizeVariant,
	propType: PropType,
	enablePropTypeUnits: boolean,
	externalUnits?: Unit[],
	actualExtendedOptions?: ExtendedOption[],
	defaultUnit?: Unit | ExtendedOption,
	externalPlaceholderUnit?: Unit | ExtendedOption
) {
	const actualDefaultUnit = useMemo(
		() => defaultUnit ?? externalPlaceholderUnit ?? defaultSelectedUnit[ variant ],
		[ defaultUnit, externalPlaceholderUnit, variant ]
	);

	const actualUnits = useMemo(
		() => resolveUnits( propType, enablePropTypeUnits, variant, externalUnits, actualExtendedOptions ),
		[ propType, enablePropTypeUnits, variant, externalUnits, actualExtendedOptions ]
	);

	return {
		actualDefaultUnit,
		actualUnits,
	};
}

function resolveUnits(
	propType: PropType,
	enablePropTypeUnits: boolean,
	variant: SizeVariant,
	externalUnits?: Unit[],
	actualExtendedOptions?: ExtendedOption[]
) {
	const fallback = [ ...defaultUnits[ variant ] ];

	if ( ! enablePropTypeUnits ) {
		return [ ...( externalUnits ?? fallback ), ...( actualExtendedOptions || [] ) ];
	}

	return ( propType.settings?.available_units as Unit[] ) ?? fallback;
}
