import { Filler, InjectionOptions, Location } from './types';
import { injectInto } from './injections';

export function createInjectIntoFnFor( location: Location ) {
	return ( filler: Filler, options?: InjectionOptions ) => {
		return injectInto( location, filler, options );
	};
}
