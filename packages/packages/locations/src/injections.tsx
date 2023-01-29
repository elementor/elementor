import { Location, Filler, Injection, InjectionOptions, Name } from './types';
import FillWrapper from './components/filler-wrapper';

const DEFAULT_PRIORITY = 10;

let injections: Map<string, Injection> = new Map();

type InjectIntoArgs = {
	location: Location;
	filler: Filler;
	name: Name;
	options?: InjectionOptions;
}

export function injectInto( { location, filler, name, options = {} }: InjectIntoArgs ) {
	const id = generateId( location, name );

	const existingInjection = injections.get( id );

	if ( existingInjection && ! options?.overwrite ) {
		// eslint-disable-next-line no-console
		console.error(
			`An injection named "${ name }" under location "${ location }" already exists. Did you mean to use "options.overwrite"?`
		);

		return;
	}

	const fallbackPriority = existingInjection
		? existingInjection.priority
		: DEFAULT_PRIORITY;

	const injection = {
		id,
		location,
		filler: wrapFiller( filler ),
		priority: options.priority ?? fallbackPriority,
	};

	injections.set( id, injection );
}

export function createInjectorFor( location: Location ) {
	return ( { filler, name, options }: Omit<InjectIntoArgs, 'location'> ) => {
		return injectInto( { location, name, filler, options } );
	};
}

export function getInjectionsOf( location: string ): Injection[] {
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

function generateId( location: Location, name: Name ) {
	return `${ location }::${ name }`;
}
