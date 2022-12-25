import { FillWithOptionalPriority } from './types';
import { addFill } from './locations';

export function createFillFunction( location: string ) {
	return ( { component, priority }: Omit<FillWithOptionalPriority, 'location'> ): void => {
		addFill( { location, component, priority } );
	};
}
