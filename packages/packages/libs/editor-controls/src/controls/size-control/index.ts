// Export types
export type {
	SizeVariant,
	UnitProps,
	BaseSizeControlProps,
	LengthSizeControlProps,
	AngleSizeControlProps,
	TimeSizeControlProps,
	SizeControlProps,
} from './size-control-types';
export { CUSTOM_SIZE_LABEL } from './size-control-types';

// Export variant-specific controls
export { LengthSizeControl } from './length-size-control';
export { AngleSizeControl } from './angle-size-control';
export { TimeSizeControl } from './time-size-control';

// Export generic proxy component
export { SizeControl } from './size-control';
