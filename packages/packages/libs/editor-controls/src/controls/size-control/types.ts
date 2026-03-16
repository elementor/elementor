type LengthUnit = 'px' | '%' | 'em' | 'rem' | 'vw' | 'vh' | 'ch';
type AngleUnit = 'deg' | 'rad' | 'grad' | 'turn';
type TimeUnit = 's' | 'ms';

type ExtendedSizeOption = 'auto' | 'custom';

type Unit = LengthUnit | AngleUnit | TimeUnit;

export type SizeUnit = Unit | ExtendedSizeOption;

export type SizeVariant = 'length' | 'angle' | 'time';
// clear all
// cmd + f = search
// cmd + e = expand
// cmd + shif + f = fold ???
// cmd h = highlight
// cmd + shift + c = copy
// cmd + shift e = export
// search nested ability right now only searched top
// no search available for this text fallback to root/parent object
// command pallet


// if search is not matching for data previewed && if data doesnt match for serach availbale
