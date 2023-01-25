import { Filler, InjectionOptions, Location, Name } from './types';
import { injectInto } from './injections';

export function createInjectIntoFnFor( location: Location ) {
	return ( { filler, name, options }: { filler: Filler, name: Name, options?: InjectionOptions } ) => {
		return injectInto( {
			location,
			name,
			filler,
			options,
		} );
	};
}
