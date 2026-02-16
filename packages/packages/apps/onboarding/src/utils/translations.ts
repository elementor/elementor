function getStrings(): Record< string, string > {
	return window.elementorAppConfig?.[ 'e-onboarding' ]?.strings ?? {};
}

export function t( key: string, ...args: string[] ): string {
	const strings = getStrings();
	let template = strings[ key ];

	if ( ! template ) {
		if ( process.env.NODE_ENV !== 'production' ) {
			console.warn( `[onboarding] Missing translation for key: "${ key }"` ); // eslint-disable-line no-console
		}

		return key;
	}

	for ( let i = 0; i < args.length; i++ ) {
		template = template.replace( `%${ i + 1 }$s`, args[ i ] );
		template = template.replace( '%s', args[ i ] );
	}

	return template;
}
