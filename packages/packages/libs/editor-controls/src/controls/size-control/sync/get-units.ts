import { type SizeUnit } from '../types';

export const getLengthUnits = () => {
	return ( window.elementor?.config?.size_units?.length ?? [] ) as SizeUnit[];
};

export const getAngleUnits = () => {
	return ( window.elementor?.config?.size_units?.angle ?? [] ) as SizeUnit[];
};

export const getTimeUnits = () => {
	return ( window.elementor?.config?.size_units?.time ?? [] ) as SizeUnit[];
};

export const getExtendedUnits = () => {
	return ( window.elementor?.config?.size_units?.extended_units ?? [] ) as SizeUnit[];
};
