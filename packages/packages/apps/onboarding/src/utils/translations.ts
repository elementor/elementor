import { DEFAULT_STRINGS } from './default-strings';

function getStrings(): Record< string, string > {
	return {
		...DEFAULT_STRINGS,
		...window.elementorAppConfig?.[ 'e-onboarding' ]?.strings,
	};
}

export function t( key: string, ...args: string[] ): string {
	const strings = getStrings();
	let template = strings[ key ];

	if ( ! template ) {

		return key;
	}

	for ( let i = 0; i < args.length; i++ ) {
		template = template.replace( `%${ i + 1 }$s`, args[ i ] );
		template = template.replace( '%s', args[ i ] );
	}

	return template;
}
