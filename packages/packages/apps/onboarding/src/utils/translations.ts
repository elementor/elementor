declare global {
	interface Window {
		elementorAppConfig?: {
			'e-onboarding'?: {
				strings?: Record< string, string >;
				[ key: string ]: unknown;
			};
			[ key: string ]: unknown;
		};
	}
}

function getStrings(): Record< string, string > {
	return window.elementorAppConfig?.[ 'e-onboarding' ]?.strings ?? {};
}

export function t( key: string, ...args: string[] ): string {
	let template = getStrings()[ key ] || key;

	for ( let i = 0; i < args.length; i++ ) {
		template = template.replace( `%${ i + 1 }$s`, args[ i ] );
		template = template.replace( '%s', args[ i ] );
	}

	return template;
}
