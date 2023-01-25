import { Location, Filler, Injection, InjectionOptions, Name } from './types';
import FillWrapper from './components/filler-wrapper';

let injections: Map<string, Injection> = new Map();

export function injectInto( { location, filler, name, options = {} }: {
	location: Location;
	filler: Filler;
	name: Name;
	options?: InjectionOptions;
} ) {
	const id = generateId( location, name );

	if ( injections.has( id ) && ! options?.overwrite ) {
		throw new Error( `Injection with id "${ id }" already exists.` );
	}

	const injection = {
		id,
		location,
		filler: wrapFiller( filler ),
		priority: options?.priority || 100,
	};

	injections.set( id, injection );

	return injection;
}

export function getInjectionsAt( location: string ): Injection[] {
	return [ ...injections.values() ]
		.filter( ( { location: fillerLocation } ) => fillerLocation === location )
		.sort( ( a, b ) => a.priority - b.priority );
}

export function resetInjections() {
	injections = new Map();
}

function wrapFiller( FillerComponent: Filler ) {
	return () => (
		<FillWrapper>
			<FillerComponent />
		</FillWrapper>
	);
}

function generateId( location: Location, name: string ): string {
	return `${ location }:${ name }`;
}
