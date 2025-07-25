import { type Breakpoint } from '../types';
import { getBreakpointsByWidths } from './utils/get-breakpoints-by-widths';

export function getBreakpoints(): Breakpoint[] {
	const { minWidth, defaults, maxWidth } = getBreakpointsByWidths();
	return [ ...minWidth, ...defaults, ...maxWidth ];
}
