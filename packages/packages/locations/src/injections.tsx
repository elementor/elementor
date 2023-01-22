import { Location, Filler, Injection, InjectionOptions, Id } from './types';
import FillWrapper from './components/filler-wrapper';

let injections: Map<Id, Injection> = new Map();
let locationsCurrentIds: Map<Location, number> = new Map();

export function injectInto(
	location: Location,
	filler: Filler,
	options?: InjectionOptions
) {
	const id = generateId( location, options?.id );

	const injection = {
		id,
		location,
		filler: wrapFiller( filler ),
		priority: options?.priority || 10,
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
	locationsCurrentIds = new Map();
}

function wrapFiller( FillerComponent: Filler ) {
	return () => (
		<FillWrapper>
			<FillerComponent />
		</FillWrapper>
	);
}

function generateId( location: Location, id?: Id ): Id {
	if ( ! id ) {
		const nextId = ( locationsCurrentIds.get( location ) || 0 ) + 1;

		locationsCurrentIds.set( location, nextId );

		id = nextId.toString();
	}

	return `${ location }--${ id }`;
}
