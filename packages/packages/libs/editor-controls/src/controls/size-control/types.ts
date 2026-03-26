import type { CreateOptions } from '@elementor/editor-props';

import { type SetValueMeta } from '../../bound-prop-context';

type LengthUnit = 'px' | '%' | 'em' | 'rem' | 'vw' | 'vh' | 'ch';
type AngleUnit = 'deg' | 'rad' | 'grad' | 'turn';
type TimeUnit = 's' | 'ms';

type ExtendedSizeOption = 'auto' | 'custom';

type Unit = LengthUnit | AngleUnit | TimeUnit;

export type SizeUnit = Unit | ExtendedSizeOption;

export type SizeVariant = 'length' | 'angle' | 'time';

export type SetSizeValue< T > = ( value: T, options?: CreateOptions, meta?: SetValueMeta ) => void;
