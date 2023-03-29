import { Location, Filler, Injection, InjectionOptions, Name, Id } from './types';
import FillerWrapper from './components/filler-wrapper';

const DEFAULT_PRIORITY = 10;

const injections: Map<Id, Injection> = new Map();

type InjectArgs = {
	location: Location;
	filler: Filler;
	name: Name;
	options?: InjectionOptions;
}

export function inject( { location, filler, name, options = {} }: InjectArgs ) {
	const id = generateId( location, name );

	if ( injections.has( id ) && ! options?.overwrite ) {
		// eslint-disable-next-line no-console
		console.error(
			`An injection named "${ name }" under location "${ location }" already exists. Did you mean to use "options.overwrite"?`
		);

		return;
	}

	const injection = {
		id,
		location,
		filler: wrapFiller( filler ),
		priority: options.priority ?? DEFAULT_PRIORITY,
	};

	injections.set( id, injection );
}

export function createInjectorFor( location: Location ) {
	return ( { filler, name, options }: Omit<InjectArgs, 'location'> ) => {
		return inject( { location, name, filler, options } );
	};
}

export function getInjectionsOf( location: string ) {
	return [ ...injections.values() ]
		.filter( ( injection ) => injection.location === location )
		.sort( ( a, b ) => a.priority - b.priority );
}

export function flushInjections() {
	injections.clear();
}

function wrapFiller( FillerComponent: Filler ) {
	return ( props: object ) => (
		<FillerWrapper>
			<FillerComponent { ...props } />
		</FillerWrapper>
	);
}

function generateId( location: Location, name: Name ) {
	return `${ location }::${ name }`;
}
