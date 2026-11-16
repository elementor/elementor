import type { CreateOptions } from '@elementor/editor-props';

import { type SetValueMeta } from '../../bound-prop-context';
import { type ExtendedOption } from '../../utils/size-control';

export type ExtendedSizeOption = ExtendedOption;
export type { SizeUnit } from '../../utils/size-control';
export type SizeVariant = 'length' | 'angle' | 'time';

export type SetSizeValue< T > = ( value: T, options?: CreateOptions, meta?: SetValueMeta ) => void;
