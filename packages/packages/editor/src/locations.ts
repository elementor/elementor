import { FillWithOptionalPriority, addFill } from '@elementor/locations';

export const LOCATION_TOP = 'editor/top';

export function addToTop( { component, priority }: Omit<FillWithOptionalPriority, 'location'> ) {
	addFill( { location: LOCATION_TOP, component, priority } );
}
